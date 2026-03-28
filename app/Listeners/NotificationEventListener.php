<?php

namespace App\Listeners;

use App\Events\NotificationEvent;
use App\Jobs\SendPushNotification;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class NotificationEventListener
{
    public function handle(NotificationEvent $event): void
    {
        try {
            $model = $event->notifiableModel;
            $notificationType = $event->notificationType;
            $additionalData = $event->additionalData;

            $modelClass = get_class($model);
            
            // Check for method first (for models with translation functions)
            if (method_exists($modelClass, 'getNotificationTemplates')) {
                $baseTemplates = $modelClass::getNotificationTemplates();
            }
            // Fall back to static property (for models with hardcoded strings)
            elseif (property_exists($modelClass, 'notificationTemplates')) {
                $baseTemplates = $modelClass::$notificationTemplates;
            }
            else {
                Log::info("Model {$modelClass} does not have getNotificationTemplates method or \$notificationTemplates property. Skipping template-based notification.");
                return;
            }

            $eventTemplates = Arr::get($baseTemplates, $notificationType);
            if (empty($eventTemplates)) {
                Log::warning("No notification templates found for model {$modelClass}, type: {$notificationType}");
                return;
            }

            foreach ($event->recipients as $recipientType => $recipient) {
                if (!$recipient instanceof User) {
                    Log::warning("Recipient is not a User instance for type: {$recipientType} in event for {$modelClass} ID {$model->getKey()}");
                    continue;
                }

                // Check if user has enabled notifications for this type BEFORE processing
                if (!$this->shouldSendNotification($recipient, $notificationType)) {
                    Log::info("User {$recipient->id} has disabled notifications for type: {$notificationType}");
                    continue;
                }

                // Set the locale to the user's language preference before generating templates
                $userLocale = $recipient->language_preference ?? config('app.fallback_locale', 'en');
                app()->setLocale($userLocale);
                
                // Regenerate templates with the user's locale
                if (method_exists($modelClass, 'getNotificationTemplates')) {
                    $baseTemplates = $modelClass::getNotificationTemplates();
                    $eventTemplates = Arr::get($baseTemplates, $notificationType);
                }

                $recipientTemplateSet = Arr::get($eventTemplates, $recipientType);
                if (empty($recipientTemplateSet)) {
                    Log::info("No specific template found for model {$modelClass}, type: {$notificationType}, recipient type: {$recipientType}");
                    continue;
                }

                $titleTemplate = Arr::get($recipientTemplateSet, 'title', '');
                $bodyTemplate = Arr::get($recipientTemplateSet, 'body', '');
                $imagePath = Arr::get($recipientTemplateSet, 'image', '');

                $placeholders = $this->getPlaceholders($model, $recipient, $recipientType);

                // Generate content in all languages
                $multilingualContent = $this->generateMultilingualContent($modelClass, $notificationType, $recipientType, $placeholders);

                $contextData = $this->getNotificationContextData($model, $recipient, $recipientType, $notificationType);

                $notificationData = [
                    'title' => $multilingualContent['en']['title'],
                    'description' => $multilingualContent['en']['description'],
                    'image' => $imagePath,
                    'user_id' => $recipient->id,
                    'notifiable_id' => $model->getKey(),
                    'notifiable_type' => $modelClass,
                    'notification_type' => $notificationType,
                    'recipient_type' => $recipientType,
                    'status' => 'unread'
                ];

                // Add rejection reason if it exists in additional data
                if (!empty($additionalData) && isset($additionalData['rejection_reason'])) {
                    $notificationData['rejection_reason'] = $additionalData['rejection_reason'];
                }

                $notification = Notification::create($notificationData);
                
                Log::info("Notification created for user {$recipient->id}: {$notification->title}");

                // Broadcast real-time notification
                broadcast(new \App\Events\NotificationCreated($notification, $recipient->id));

                // Send push notification if user has device tokens
                if (method_exists($recipient, 'deviceTokens') && $recipient->deviceTokens()->exists()) {
                    SendPushNotification::dispatch($notification, $recipient);
                } else {
                    Log::info("User {$recipient->id} has no device tokens for push notification for {$modelClass} ID {$model->getKey()}.");
                }
            }
        } catch (\Throwable $e) {
            Log::error('Error processing notification event: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'notification_type' => $event->notificationType ?? 'unknown',
                'model_id' => optional($event->notifiableModel)->getKey() ?? 'unknown',
                'model_type' => isset($event->notifiableModel) ? get_class($event->notifiableModel) : 'unknown',
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    private function getPlaceholders(Model $model, User $recipient, string $recipientType): array
    {
        $placeholders = [
            '{recipient_name}' => $recipient->name ?? '',
        ];

        if (method_exists($model, 'getNotificationPlaceholders')) {
            try {
                $placeholders = array_merge($placeholders, $model->getNotificationPlaceholders($recipient, $recipientType));
            } catch (\Exception $e) {
                Log::error("Error getting placeholders from " . get_class($model) . ": " . $e->getMessage());
            }
        } else {
            $placeholders['{model_id}'] = $model->getKey();
            $placeholders['{model_name}'] = method_exists($model, 'getNameAttribute') ? $model->name : (method_exists($model, 'getAttributeValue') ? $model->getAttributeValue('name') ?? get_class($model) : get_class($model));
        }

        return $placeholders;
    }

    private function getNotificationContextData(Model $model, User $recipient, string $recipientType, string $notificationType): array
    {
        $contextData = [
            'recipient_type' => $recipientType,
            'notification_type' => $notificationType,
            $model->getKeyName() => $model->getKey(),
            'model_class' => get_class($model),
        ];

        if (method_exists($model, 'getNotificationContextData')) {
            try {
                $contextData = array_merge($contextData, $model->getNotificationContextData($recipient, $notificationType));
            } catch (\Exception $e) {
                Log::error("Error getting context data from " . get_class($model) . ": " . $e->getMessage());
            }
        }

        return $contextData;
    }

    private function generateMultilingualContent(string $modelClass, string $notificationType, string $recipientType, array $placeholders): array
    {
        $languages = ['en'];
        $content = [];

        foreach ($languages as $lang) {
            // Set the locale for this language
            app()->setLocale($lang);
            
            // Get templates for this language
            if (method_exists($modelClass, 'getNotificationTemplates')) {
                $templates = $modelClass::getNotificationTemplates();
                $eventTemplates = $templates[$notificationType] ?? null;
                
                if ($eventTemplates) {
                    $recipientTemplateSet = $eventTemplates[$recipientType] ?? null;
                    
                    if ($recipientTemplateSet) {
                        $titleTemplate = $recipientTemplateSet['title'] ?? '';
                        $bodyTemplate = $recipientTemplateSet['body'] ?? '';
                        
                        // Replace placeholders
                        $title = str_replace(array_keys($placeholders), array_values($placeholders), $titleTemplate);
                        $description = str_replace(array_keys($placeholders), array_values($placeholders), $bodyTemplate);
                        
                        $content[$lang] = [
                            'title' => $title,
                            'description' => $description
                        ];
                    } else {
                        $content[$lang] = [
                            'title' => 'Notification',
                            'description' => 'Item updated'
                        ];
                    }
                } else {
                    $content[$lang] = [
                        'title' => 'Notification',
                        'description' => 'Item updated'
                    ];
                }
            } else {
                $content[$lang] = [
                    'title' => 'Notification',
                    'description' => 'Item updated'
                ];
            }
        }

        return $content;
    }

    /**
     * Check if user has enabled notifications for a specific type
     */
    private function shouldSendNotification(User $user, string $notificationType): bool
    {
        // For now, always return true
        // You can implement notification settings later
        return true;
    }
}
