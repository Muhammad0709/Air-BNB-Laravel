<?php

namespace App\Jobs;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification as FirebaseNotification;
use Kreait\Firebase\Exception\MessagingException;

class SendPushNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $notification;
    protected $recipient;
    public $tries = 3;

    public function __construct(Notification $notification, User $recipient)
    {
        $this->notification = $notification;
        $this->recipient = $recipient;
    }

    public function handle(): void
    {
        try {
            $deviceTokens = $this->recipient->deviceTokens()->pluck('devices_token')->filter()->unique()->toArray();
            if (empty($deviceTokens)) {
                Log::info("No valid device tokens found for user: " . $this->recipient->id . " for Notification ID: " . $this->notification->id);
                return;
            }

            $locale = $this->recipient->language_preference ?? config('app.fallback_locale', 'en');

            // Get title and description based on user's language preference
            $title = $this->notification->getLocalizedContent('title', $locale);
            $body = $this->notification->getLocalizedContent('description', $locale);

            $filePath = config('services.firebase.credentials');

            $factory = (new Factory)->withServiceAccount($filePath);
            $messaging = $factory->createMessaging();

            // Get notification image
            $imageUrl = $this->notification->image;

            // Create Firebase notification with image if available
            $firebaseNotification = FirebaseNotification::create($title, $body);
            if ($imageUrl) {
                $firebaseNotification = $firebaseNotification->withImageUrl($imageUrl);
            }
            
            $dataPayload = [
                'notification_id' => (string) $this->notification->id,
                'notifiable_id' => (string) $this->notification->notifiable_id,
                'notifiable_type' => (string) $this->notification->notifiable_type,
                'user_id' => (string) $this->recipient->id,
                'user_name' => $this->recipient->name,
                'image_url' => $imageUrl,
            ];

            $message = CloudMessage::new()
                ->withNotification($firebaseNotification)
                ->withData($dataPayload);

            $report = $messaging->sendMulticast($message, $deviceTokens);

            $failedSends = $report->failures()->count();
            if ($failedSends > 0) {
                Log::warning("Some push notifications failed for Notification ID: {$this->notification->id}, User ID: {$this->recipient->id}. Failures: {$failedSends}.", [
                    'failed_tokens_details' => $this->getFailedTokenDetails($report),
                ]);
            }
        } catch (MessagingException $e) {
            Log::error('Firebase Messaging Exception while sending push notification', [
                'notification_id' => $this->notification->id,
                'user_id' => $this->recipient->id,
                'error' => $e->getMessage(),
                'code' => $e->getCode(),
                'trace' => $e->getTraceAsString(),
            ]);
        } catch (\Throwable $e) {
            Log::error('Generic Exception while sending push notification', [
                'notification_id' => $this->notification->id,
                'user_id' => $this->recipient->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    private function getFailedTokenDetails(\Kreait\Firebase\Messaging\MulticastSendReport $report): array
    {
        $details = [];
        foreach ($report->failures()->getItems() as $failure) {
            $details[$failure->target()->value()] = $failure->error()->getMessage();
        }
        return $details;
    }
}
