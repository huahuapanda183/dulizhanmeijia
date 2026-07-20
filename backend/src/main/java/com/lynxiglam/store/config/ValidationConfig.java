package com.lynxiglam.store.config;

import jakarta.validation.Validator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ReloadableResourceBundleMessageSource;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.FixedLocaleResolver;

import java.util.Locale;

/**
 * Pins bean-validation messages to English.
 *
 * Jakarta's default messages are resolved against the server JVM's locale, so on a
 * zh-CN machine the API answered an English storefront with
 * {@code {"email":"不是一个合法的电子邮件地址"}} and {@code {"lines":"不能为空"}} —
 * and the checkout form renders those strings to the customer verbatim. The
 * message language must be a property of the API contract, not of whichever
 * machine happens to run the JVM.
 *
 * English is the right default here because the storefront's source locale is
 * English and the frontend dictionary keys off the English string. Localising
 * validation errors properly would mean returning a stable machine-readable code
 * per field and translating client-side; that is a contract change, deliberately
 * not attempted here.
 */
@Configuration
public class ValidationConfig {

    /**
     * Overrides Boot's auto-configured validator. Without an explicit
     * MessageSource the interpolator falls back to Hibernate Validator's bundled
     * ValidationMessages, which is locale-sensitive.
     */
    @Bean
    public LocalValidatorFactoryBean defaultValidator() {
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        ReloadableResourceBundleMessageSource messages = new ReloadableResourceBundleMessageSource();
        messages.setBasename("classpath:org/hibernate/validator/ValidationMessages");
        messages.setDefaultEncoding("UTF-8");
        // The decisive bit: resolve with Locale.ENGLISH regardless of JVM default.
        messages.setDefaultLocale(Locale.ENGLISH);
        messages.setFallbackToSystemLocale(false);
        validator.setValidationMessageSource(messages);
        return validator;
    }

    /** Keeps request-scoped locale from re-introducing a translated message via Accept-Language. */
    @Bean
    public LocaleResolver localeResolver() {
        return new FixedLocaleResolver(Locale.ENGLISH);
    }

    /** Exposed so components can inject jakarta.validation.Validator directly. */
    @Bean
    public Validator jakartaValidator(LocalValidatorFactoryBean validator) {
        return validator;
    }
}
