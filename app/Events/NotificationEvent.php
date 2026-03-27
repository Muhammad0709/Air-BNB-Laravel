<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NotificationEvent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $notifiableModel;
    public $notificationType;
    public $recipients;
    public $additionalData;

    /**
     * Create a new event instance.
     */
    public function __construct(
        Model $notifiableModel,
        string $notificationType,
        array $recipients = [],
        array $additionalData = []
    ) {
        $this->notifiableModel = $notifiableModel;
        $this->notificationType = $notificationType;
        $this->recipients = $recipients;
        $this->additionalData = $additionalData;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('notification.' . $this->notifiableModel->id),
        ];
    }
}
