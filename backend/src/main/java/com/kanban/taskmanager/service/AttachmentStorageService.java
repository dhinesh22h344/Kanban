package com.kanban.taskmanager.service;

import com.kanban.taskmanager.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class AttachmentStorageService {

    private final Path storageRoot;

    public AttachmentStorageService(@Value("${app.attachments.storage-path}") String storagePath) {
        this.storageRoot = Path.of(storagePath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(storageRoot);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create attachment storage directory: " + storageRoot, e);
        }
    }

    /** Stores the file under a date-partitioned, UUID-named path and returns that relative path. */
    public String store(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Attachment file is empty");
        }

        String extension = "";
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.'));
        }

        String relativePath = LocalDate.now().toString().replace("-", "/") + "/" + UUID.randomUUID() + extension;
        Path target = storageRoot.resolve(relativePath).normalize();

        if (!target.startsWith(storageRoot)) {
            throw new BadRequestException("Invalid file path");
        }

        try {
            Files.createDirectories(target.getParent());
            file.transferTo(target);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store attachment", e);
        }

        return relativePath;
    }

    public InputStream load(String relativePath) {
        Path target = storageRoot.resolve(relativePath).normalize();
        if (!target.startsWith(storageRoot)) {
            throw new BadRequestException("Invalid file path");
        }
        try {
            return Files.newInputStream(target);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load attachment", e);
        }
    }
}
