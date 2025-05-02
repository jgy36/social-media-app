package com.jgy36.PoliticalApp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class MediaConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get the absolute path to the uploads directory
        File uploadsDir = new File("uploads/media");
        String absolutePath = uploadsDir.getAbsolutePath();

        System.out.println("🖼️ Media config: Serving files from: " + absolutePath);

        // Use file: protocol with the absolute path
        registry.addResourceHandler("/media/**")
                .addResourceLocations("file:" + absolutePath + "/")
                .setCacheControl(CacheControl.noCache());

        // List files in directory for debugging
        if (uploadsDir.exists() && uploadsDir.isDirectory()) {
            File[] files = uploadsDir.listFiles();
            if (files != null) {
                System.out.println("🖼️ Media directory contains " + files.length + " files:");
                for (File file : files) {
                    System.out.println("   - " + file.getName() + " (" + file.length() + " bytes)");
                }
            } else {
                System.out.println("🖼️ Media directory is empty or cannot be read");
            }
        }
    }
}
