<?php

use App\Models\Conversation;
use App\Models\User;
use App\Enums\UserType;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    $conversation = Conversation::find($conversationId);
    if (! $conversation) {
        return false;
    }
    return $user->id === $conversation->user_id || $user->id === $conversation->property->user_id;
});

Broadcast::channel('admin-notifications', function ($user) {
    return $user->type === UserType::Admin->value;
});

Broadcast::channel('user-notifications', function ($user) {
    return $user->type === UserType::User->value;
});
