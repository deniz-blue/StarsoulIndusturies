package dev.tuxebro.sparkauto;

import com.mojang.logging.LogUtils;
import net.neoforged.bus.api.SubscribeEvent;
import net.neoforged.fml.common.EventBusSubscriber;
import net.neoforged.fml.common.Mod;
import net.neoforged.neoforge.event.server.ServerStartedEvent;
import net.neoforged.neoforge.event.server.ServerStoppingEvent;
import net.neoforged.neoforge.event.tick.ServerTickEvent;
import org.slf4j.Logger;

@EventBusSubscriber
@Mod(SparkAuto.MODID)
public class SparkAuto {
    public static final String MODID = "spark_auto";
    static final Logger LOGGER = LogUtils.getLogger();

    private static LowTpsProfiler profiler;

    @SubscribeEvent
    public static void onServerStarted(ServerStartedEvent event) {
        profiler = new LowTpsProfiler(event.getServer());
    }

    @SubscribeEvent
    public static void onServerStopping(ServerStoppingEvent event) {
        profiler = null;
    }

    @SubscribeEvent
    public static void onServerTick(ServerTickEvent.Post event) {
        if (profiler != null) {
            profiler.tick();
        }
    }
}
