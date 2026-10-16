package blue.deniz.starsoul.earlyfixes;

import cpw.mods.modlauncher.api.IEnvironment;
import cpw.mods.modlauncher.api.ITransformationService;
import cpw.mods.modlauncher.api.ITransformer;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

// Relauncher 1.1.0 asks for the process arguments through ProcessHandleImpl, which is not public, so it
// never gets them. Windows and Linux then hand it the exact command line. On macOS it splits
// sun.java.command on spaces instead, which breaks a game directory under "Library/Application Support".
// Before restarting, it replaces org.prismlauncher.EntryPoint with the system property
// org.prismlauncher.launch.mainclass followed by org.prismlauncher.launch.gameargs split on U+001F.
public class KeepSpacesInRelaunchArguments implements ITransformationService {
    private static final Logger LOGGER = LogManager.getLogger("Starsoul early fixes");
    private static final String JAVA_COMMAND = "sun.java.command";
    private static final String RELAUNCHED = "relauncher.didRelaunch";
    private static final String PRISM_ENTRY_POINT = "org.prismlauncher.EntryPoint";
    private static final String PRISM_MAIN_CLASS = "org.prismlauncher.launch.mainclass";
    private static final String PRISM_GAME_ARGUMENTS = "org.prismlauncher.launch.gameargs";
    private static final String PRISM_GAME_ARGUMENT_SEPARATOR = "\u001F";

    private final Map<String, String> replacedProperties = new HashMap<>();

    @Override
    public String name() {
        return "starsoul_keep_spaces_in_relaunch_arguments";
    }

    @Override
    public void onLoad(IEnvironment environment, Set<String> otherServices) {
        if (Boolean.getBoolean(RELAUNCHED) || operatingSystemExposesCommandLine()) {
            return;
        }
        var javaCommand = System.getProperty(JAVA_COMMAND);
        var processArguments = ProcessHandle.current().info().arguments();
        if (javaCommand == null || processArguments.isEmpty()) {
            return;
        }
        var properties = prismLaunchProperties(List.of(processArguments.get()), javaCommand);
        properties.forEach(this::replaceProperty);
        if (!properties.isEmpty()) {
            LOGGER.info("Passed the game arguments to the relauncher through PrismLauncher's launch properties");
        }
    }

    private static boolean operatingSystemExposesCommandLine() {
        return System.getProperty("os.name", "").toLowerCase(Locale.ROOT).contains("win")
                || Files.exists(Path.of("/proc/self/cmdline"));
    }

    static Map<String, String> prismLaunchProperties(List<String> processArguments, String javaCommand) {
        var mainClass = javaCommand.split(" ", 2)[0];
        var mainClassIndex = processArguments.indexOf(mainClass);
        if (mainClassIndex < 0) {
            return Map.of();
        }
        var mainClassArguments = processArguments.subList(mainClassIndex + 1, processArguments.size());
        var matchesJavaCommand = String.join(" ", processArguments.subList(mainClassIndex, processArguments.size())).equals(javaCommand);
        if (!matchesJavaCommand || mainClassArguments.stream().noneMatch(argument -> argument.contains(" "))) {
            return Map.of();
        }
        return Map.of(
                JAVA_COMMAND, PRISM_ENTRY_POINT,
                PRISM_MAIN_CLASS, mainClass,
                PRISM_GAME_ARGUMENTS, String.join(PRISM_GAME_ARGUMENT_SEPARATOR, mainClassArguments));
    }

    private void replaceProperty(String key, String value) {
        replacedProperties.put(key, System.getProperty(key));
        System.setProperty(key, value);
    }

    @Override
    public void initialize(IEnvironment environment) {
    }

    // ModLauncher calls beginScanning after every service's initialize, and the relauncher only returns
    // from its initialize when it did not restart the game.
    @Override
    public List<Resource> beginScanning(IEnvironment environment) {
        replacedProperties.forEach((key, value) -> {
            if (value == null) {
                System.clearProperty(key);
            } else {
                System.setProperty(key, value);
            }
        });
        replacedProperties.clear();
        return List.of();
    }

    @Override
    public List<? extends ITransformer<?>> transformers() {
        return List.of();
    }
}
