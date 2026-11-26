package dev.tuxebro.sparkauto;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.zip.GZIPInputStream;

import static dev.tuxebro.sparkauto.SparkAuto.LOGGER;

final class ProfileDownload {
    private static final String BYTEBIN_URL = "https://spark-usercontent.lucko.me/";
    private static final DateTimeFormatter FILE_TIME = DateTimeFormatter.ofPattern("yyyy-MM-dd_HH.mm.ss");
    private static final HttpClient HTTP = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    private ProfileDownload() {}

    static void downloadFromViewerUrl(String viewerUrl, Path directory) {
        var key = viewerUrl.substring(viewerUrl.lastIndexOf('/') + 1);
        var request = HttpRequest.newBuilder(URI.create(BYTEBIN_URL + key))
                .timeout(Duration.ofMinutes(2))
                .header("User-Agent", SparkAuto.MODID)
                .GET()
                .build();
        HTTP.sendAsync(request, HttpResponse.BodyHandlers.ofInputStream())
                .thenAccept(response -> {
                    if (response.statusCode() != 200) {
                        LOGGER.warn("Could not download {}: HTTP {}", viewerUrl, response.statusCode());
                        return;
                    }
                    var target = directory.resolve(fileName(key));
                    try (var body = decoded(response)) {
                        Files.createDirectories(directory);
                        Files.copy(body, target, StandardCopyOption.REPLACE_EXISTING);
                        LOGGER.info("Saved the auto profile to {}", target);
                    } catch (IOException e) {
                        LOGGER.warn("Could not save {} to {}", viewerUrl, target, e);
                    }
                })
                .exceptionally(e -> {
                    LOGGER.warn("Could not download {}", viewerUrl, e);
                    return null;
                });
    }

    static void copySavedFile(Path savedFile, Path directory) {
        try {
            Files.createDirectories(directory);
            var target = directory.resolve(savedFile.getFileName());
            Files.copy(savedFile, target, StandardCopyOption.REPLACE_EXISTING);
            LOGGER.info("spark could not upload, copied its saved profile to {}", target);
        } catch (IOException e) {
            LOGGER.warn("Could not copy {} to {}", savedFile, directory, e);
        }
    }

    private static InputStream decoded(HttpResponse<InputStream> response) throws IOException {
        var encoding = response.headers().firstValue("Content-Encoding").orElse("");
        return encoding.equalsIgnoreCase("gzip") ? new GZIPInputStream(response.body()) : response.body();
    }

    private static String fileName(String key) {
        return LocalDateTime.now().format(FILE_TIME) + "-" + key + ".sparkprofile";
    }
}
