package com.lynxiglam.store.analytics;

import com.lynxiglam.store.common.dto.Dtos.AnalyticsSummaryDto;
import com.lynxiglam.store.common.dto.Dtos.TrackEventRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AnalyticsController {
    private final AnalyticsService analytics;

    public AnalyticsController(AnalyticsService analytics) {
        this.analytics = analytics;
    }

    @PostMapping("/analytics/events")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void track(@Valid @RequestBody TrackEventRequest event) {
        analytics.track(event);
    }

    @GetMapping("/analytics")
    AnalyticsSummaryDto summary() {
        return analytics.summary();
    }
}
