package com.lynxiglam.store.collection;

import com.lynxiglam.store.common.NotFoundException;
import com.lynxiglam.store.common.dto.Dtos.CollectionDto;
import com.lynxiglam.store.common.dto.Dtos.NavItemDto;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CollectionController {
    private final CollectionService collections;

    public CollectionController(CollectionService collections) {
        this.collections = collections;
    }

    @GetMapping("/collections")
    List<CollectionDto> all() {
        return collections.collections();
    }

    @GetMapping("/collections/handles")
    List<String> handles() {
        return collections.handles();
    }

    @GetMapping("/collections/{handle}")
    CollectionDto one(@PathVariable String handle) {
        return collections.collection(handle)
                .orElseThrow(() -> new NotFoundException("Collection not found: " + handle));
    }

    @GetMapping("/navigation")
    List<NavItemDto> navigation() {
        return collections.navigation();
    }
}
