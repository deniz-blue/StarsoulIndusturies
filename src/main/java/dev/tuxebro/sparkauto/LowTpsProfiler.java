package dev.tuxebro.sparkauto;

import me.lucko.spark.api.SparkProvider;
import me.lucko.spark.api.statistic.StatisticWindow;
import net.minecraft.server.MinecraftServer;

import java.nio.file.Path;
import java.time.Duration;
import java.util.OptionalDouble;

import static dev.tuxebro.sparkauto.SparkAuto.LOGGER;

final class LowTpsProfiler {
    private static final double LOW_TPS = 15.0;
    private static final int HIGH_CHECKS_TO_CANCEL = 3;
    private static final long CHECK_INTERVAL = Duration.ofSeconds(30).toNanos();
    private static final long PROFILE_LENGTH = Duration.ofMinutes(10).toNanos();
    private static final long PAUSE_AFTER_SAVE = Duration.ofHours(1).toNanos();
    private static final long INFO_REPLY_TIMEOUT = Duration.ofSeconds(15).toNanos();
    private static final long STOP_REPLY_TIMEOUT = Duration.ofMinutes(2).toNanos();

    private enum State { WATCHING, PROFILING, STOPPING, PAUSED }

    private enum ProfilerStatus { NOT_RUNNING, BACKGROUND, STARTED_BY_COMMAND }

    private record PendingCheck(double tps, SparkReplies info, long sentAt) {}

    private final MinecraftServer server;
    private final Path saveDirectory;
    private State state = State.WATCHING;
    private long nextCheckAt = System.nanoTime();
    private long profileStartedAt;
    private long pausedUntil;
    private int highChecksInARow;
    private PendingCheck pendingCheck;
    private SparkReplies stopReplies;
    private long stopSentAt;

    LowTpsProfiler(MinecraftServer server) {
        this.server = server;
        this.saveDirectory = server.getServerDirectory().resolve("logs").resolve("spark_auto");
    }

    void tick() {
        long now = System.nanoTime();
        switch (state) {
            case PAUSED -> {
                if (now - pausedUntil >= 0) {
                    LOGGER.info("Resuming TPS checks");
                    state = State.WATCHING;
                    nextCheckAt = now;
                }
            }
            case STOPPING -> awaitStop(now);
            case WATCHING, PROFILING -> {
                if (pendingCheck != null) {
                    finishCheck(now);
                } else if (state == State.PROFILING && now - profileStartedAt >= PROFILE_LENGTH) {
                    stopProfiler(now);
                } else if (now - nextCheckAt >= 0) {
                    startCheck(now);
                }
            }
        }
    }

    private void startCheck(long now) {
        nextCheckAt = now + CHECK_INTERVAL;
        var tps = currentTps();
        if (tps.isEmpty()) {
            return;
        }
        pendingCheck = new PendingCheck(tps.getAsDouble(), SparkReplies.runSparkCommand(server, "profiler info"), now);
    }

    private void finishCheck(long now) {
        var check = pendingCheck;
        var status = profilerStatus(check.info());
        if (status == null) {
            if (now - check.sentAt() >= INFO_REPLY_TIMEOUT) {
                LOGGER.warn("spark did not answer /spark profiler info, skipping this check");
                pendingCheck = null;
            }
            return;
        }
        pendingCheck = null;

        if (state == State.WATCHING) {
            if (check.tps() > LOW_TPS) {
                return;
            }
            if (status == ProfilerStatus.STARTED_BY_COMMAND) {
                LOGGER.info("TPS is {}, but a profiler started by someone else is running", format(check.tps()));
                return;
            }
            startProfiler(check.tps(), now);
            return;
        }

        if (status != ProfilerStatus.STARTED_BY_COMMAND) {
            LOGGER.info("The auto profiler was stopped by someone else");
            state = State.WATCHING;
            return;
        }
        highChecksInARow = check.tps() > LOW_TPS ? highChecksInARow + 1 : 0;
        if (highChecksInARow >= HIGH_CHECKS_TO_CANCEL) {
            LOGGER.info("TPS was above {} for {} checks in a row, cancelling the auto profiler", format(LOW_TPS), HIGH_CHECKS_TO_CANCEL);
            SparkReplies.runSparkCommand(server, "profiler cancel");
            state = State.WATCHING;
        }
    }

    private void startProfiler(double tps, long now) {
        LOGGER.info("TPS is {}, starting a 10 minute profiler", format(tps));
        SparkReplies.runSparkCommand(server, "profiler start --force-java-sampler");
        state = State.PROFILING;
        profileStartedAt = now;
        highChecksInARow = 0;
    }

    private void stopProfiler(long now) {
        stopReplies = SparkReplies.runSparkCommand(server, "profiler stop");
        stopSentAt = now;
        state = State.STOPPING;
    }

    private void awaitStop(long now) {
        if (stopReplies.anyLineContains("There isn't an active profiler running.")) {
            LOGGER.info("The auto profiler was stopped by someone else");
            state = State.WATCHING;
            nextCheckAt = now;
            return;
        }
        var url = stopReplies.lineAfter("Profiler stopped & upload complete!");
        var savedFile = stopReplies.textAfter("Data has been written to:");
        if (url.isPresent()) {
            LOGGER.info("Auto profiler uploaded to {}", url.get());
            ProfileDownload.downloadFromViewerUrl(url.get(), saveDirectory);
        } else if (savedFile.isPresent()) {
            ProfileDownload.copySavedFile(server.getServerDirectory().resolve(savedFile.get()), saveDirectory);
        } else if (now - stopSentAt < STOP_REPLY_TIMEOUT) {
            return;
        } else {
            LOGGER.warn("spark did not report where the auto profile went");
        }
        LOGGER.info("Pausing TPS checks for 1 hour");
        state = State.PAUSED;
        pausedUntil = now + PAUSE_AFTER_SAVE;
    }

    private static ProfilerStatus profilerStatus(SparkReplies info) {
        if (info.anyLineContains("profiler start")) {
            return ProfilerStatus.NOT_RUNNING;
        }
        if (!info.anyLineContains("profiler cancel")) {
            return null;
        }
        return info.anyLineContains("started automatically") ? ProfilerStatus.BACKGROUND : ProfilerStatus.STARTED_BY_COMMAND;
    }

    private static OptionalDouble currentTps() {
        try {
            var tps = SparkProvider.get().tps();
            return tps == null ? OptionalDouble.empty() : OptionalDouble.of(tps.poll(StatisticWindow.TicksPerSecond.SECONDS_10));
        } catch (IllegalStateException notLoadedYet) {
            return OptionalDouble.empty();
        }
    }

    private static String format(double tps) {
        return String.format("%.1f", tps);
    }
}
