package dev.tuxebro.sparkauto;

import net.minecraft.commands.CommandSource;
import net.minecraft.commands.CommandSourceStack;
import net.minecraft.network.chat.Component;
import net.minecraft.server.MinecraftServer;
import net.minecraft.world.phys.Vec2;
import net.minecraft.world.phys.Vec3;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;

final class SparkReplies implements CommandSource {
    private static final String SOURCE_NAME = "Spark Auto";

    private final List<String> lines = new CopyOnWriteArrayList<>();

    static SparkReplies runSparkCommand(MinecraftServer server, String arguments) {
        var replies = new SparkReplies();
        var source = new CommandSourceStack(replies, Vec3.ZERO, Vec2.ZERO, server.overworld(), 4,
                SOURCE_NAME, Component.literal(SOURCE_NAME), server, null);
        server.getCommands().performPrefixedCommand(source, "spark " + arguments);
        return replies;
    }

    boolean anyLineContains(String text) {
        return lines.stream().anyMatch(line -> line.contains(text));
    }

    Optional<String> lineAfter(String text) {
        var snapshot = List.copyOf(lines);
        for (int i = 0; i < snapshot.size() - 1; i++) {
            if (snapshot.get(i).contains(text)) {
                return Optional.of(snapshot.get(i + 1).trim());
            }
        }
        return Optional.empty();
    }

    Optional<String> textAfter(String text) {
        return lines.stream()
                .filter(line -> line.contains(text))
                .map(line -> line.substring(line.indexOf(text) + text.length()).trim())
                .findFirst();
    }

    @Override
    public void sendSystemMessage(Component message) {
        lines.add(message.getString());
    }

    @Override
    public boolean acceptsSuccess() {
        return true;
    }

    @Override
    public boolean acceptsFailure() {
        return true;
    }

    @Override
    public boolean shouldInformAdmins() {
        return false;
    }
}
