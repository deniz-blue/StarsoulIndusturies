package blue.deniz.starsoul.earlyfixes;

import cpw.mods.modlauncher.api.IEnvironment;
import cpw.mods.modlauncher.api.ITransformationService;
import cpw.mods.modlauncher.api.ITransformer;
import java.lang.reflect.Field;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

// On Windows with AMD or NVIDIA graphics, Sodium 0.8.13 overwrites the process command line while
// NeoForge's early window starts and never puts it back. The relauncher reads that command line to
// restart the game and launches "/" as the main class. ModLauncher calls onLoad on every service
// before it calls initialize on any, and the relauncher restarts the game from initialize.
public class RestoreSodiumCommandLine implements ITransformationService {
    private static final Logger LOGGER = LogManager.getLogger("Starsoul early fixes");
    private static final String SODIUM_WINDOWS_COMMAND_LINE = "net.caffeinemc.mods.sodium.client.platform.windows.WindowsCommandLine";
    private static final long EARLY_WINDOW_TIMEOUT_SECONDS = 30;

    @Override
    public String name() {
        return "starsoul_restore_sodium_command_line";
    }

    @Override
    public void onLoad(IEnvironment environment, Set<String> otherServices) {
        if (!System.getProperty("os.name", "").toLowerCase(Locale.ROOT).contains("win")) {
            return;
        }
        try {
            var commandLine = Class.forName(SODIUM_WINDOWS_COMMAND_LINE, false, getClass().getClassLoader());
            var activeHook = commandLine.getDeclaredField("ACTIVE_COMMAND_LINE_HOOK");
            activeHook.setAccessible(true);
            if (activeHook.get(null) == null) {
                return;
            }
            waitForEarlyWindowRenderer();
            commandLine.getMethod("resetCommandLine").invoke(null);
            LOGGER.info("Restored the command line Sodium replaced for its graphics driver workaround");
        } catch (ClassNotFoundException sodiumMissing) {
            return;
        } catch (Exception e) {
            LOGGER.error("Could not restore the command line Sodium replaced", e);
        }
    }

    // The driver reads the command line when the early window's renderer starts, so the restore waits for it.
    private static void waitForEarlyWindowRenderer() throws Exception {
        var handler = Class.forName("net.neoforged.fml.loading.ImmediateWindowHandler");
        var providerField = handler.getDeclaredField("provider");
        providerField.setAccessible(true);
        var provider = providerField.get(null);
        if (provider == null) {
            return;
        }
        var initialization = findField(provider.getClass(), "initializationFuture");
        if (initialization == null) {
            return;
        }
        initialization.setAccessible(true);
        if (initialization.get(provider) instanceof Future<?> future) {
            future.get(EARLY_WINDOW_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        }
    }

    private static Field findField(Class<?> type, String name) {
        for (var current = type; current != null; current = current.getSuperclass()) {
            try {
                return current.getDeclaredField(name);
            } catch (NoSuchFieldException ignored) {
            }
        }
        return null;
    }

    @Override
    public void initialize(IEnvironment environment) {
    }

    @Override
    public List<? extends ITransformer<?>> transformers() {
        return List.of();
    }
}
