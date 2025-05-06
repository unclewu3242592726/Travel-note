package com.travelnote.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ Configuration
 */
@Configuration
public class RabbitMQConfig {

    // Queue names
    public static final String QUEUE_NOTIFICATION = "notification.queue";
    public static final String QUEUE_NOTE_AUDIT = "note.audit.queue";
    public static final String QUEUE_EMAIL = "email.queue";
    
    // Exchange names
    public static final String EXCHANGE_TOPIC = "travel-notes.topic";
    
    // Routing keys
    public static final String ROUTING_KEY_NOTIFICATION = "notification.#";
    public static final String ROUTING_KEY_NOTE_AUDIT = "note.audit.#";
    public static final String ROUTING_KEY_EMAIL = "email.#";

    @Bean
    public Queue notificationQueue() {
        return new Queue(QUEUE_NOTIFICATION, true);
    }
    
    @Bean
    public Queue noteAuditQueue() {
        return new Queue(QUEUE_NOTE_AUDIT, true);
    }
    
    @Bean
    public Queue emailQueue() {
        return new Queue(QUEUE_EMAIL, true);
    }

    @Bean
    public TopicExchange topicExchange() {
        return new TopicExchange(EXCHANGE_TOPIC);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(notificationQueue).to(topicExchange).with(ROUTING_KEY_NOTIFICATION);
    }
    
    @Bean
    public Binding noteAuditBinding(Queue noteAuditQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(noteAuditQueue).to(topicExchange).with(ROUTING_KEY_NOTE_AUDIT);
    }
    
    @Bean
    public Binding emailBinding(Queue emailQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(emailQueue).to(topicExchange).with(ROUTING_KEY_EMAIL);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
} 