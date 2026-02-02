<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Property;
use App\Models\Conversation;
use App\Models\Message;
use App\Enums\UserType;
use App\Enums\PropertyStatus;

class CreateMessagesSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('type', UserType::USER->value)->take(3)->get();
        $properties = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->with('user')
            ->take(5)
            ->get();

        if ($users->isEmpty() || $properties->isEmpty()) {
            $this->command->warn('Need at least 3 users and 5 approved properties to seed messages.');
            return;
        }

        $conversations = [];

        foreach ($users as $index => $user) {
            if (!isset($properties[$index])) break;

            $property = $properties[$index];
            $host = $property->user;

            $conversation = Conversation::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'property_id' => $property->id,
                ],
                [
                    'user_id' => $user->id,
                    'property_id' => $property->id,
                ]
            );

            $conversations[] = $conversation;

            $messages = [
                [
                    'sender_id' => $user->id,
                    'sender_type' => 'user',
                    'message' => 'Hello! I have a question about the property.',
                    'read' => true,
                    'created_at' => now()->subHours(2),
                ],
                [
                    'sender_id' => $host->id,
                    'sender_type' => 'host',
                    'message' => 'Hi! I\'d be happy to help. What would you like to know?',
                    'read' => true,
                    'created_at' => now()->subHours(2)->addMinutes(5),
                ],
                [
                    'sender_id' => $user->id,
                    'sender_type' => 'user',
                    'message' => 'Is the property pet-friendly?',
                    'read' => true,
                    'created_at' => now()->subHours(1)->addMinutes(30),
                ],
                [
                    'sender_id' => $host->id,
                    'sender_type' => 'host',
                    'message' => 'Yes, pets are allowed with prior notification.',
                    'read' => true,
                    'created_at' => now()->subHours(1)->addMinutes(35),
                ],
                [
                    'sender_id' => $user->id,
                    'sender_type' => 'user',
                    'message' => 'hey 👋 hey',
                    'read' => false,
                    'created_at' => now()->subMinutes(30),
                ],
            ];

            foreach ($messages as $msgData) {
                Message::create(array_merge([
                    'conversation_id' => $conversation->id,
                ], $msgData));
            }
        }

        if (count($conversations) >= 2) {
            $secondUser = $users[1] ?? $users[0];
            $secondProperty = $properties[1] ?? $properties[0];
            $secondHost = $secondProperty->user;

            $conversation2 = Conversation::firstOrCreate(
                [
                    'user_id' => $secondUser->id,
                    'property_id' => $secondProperty->id,
                ],
                [
                    'user_id' => $secondUser->id,
                    'property_id' => $secondProperty->id,
                ]
            );

            $messages2 = [
                [
                    'sender_id' => $secondUser->id,
                    'sender_type' => 'user',
                    'message' => 'What time is check-in?',
                    'read' => true,
                    'created_at' => now()->subDays(1)->addHours(14),
                ],
                [
                    'sender_id' => $secondHost->id,
                    'sender_type' => 'host',
                    'message' => 'The check-in time is flexible.',
                    'read' => true,
                    'created_at' => now()->subDays(1)->addHours(14)->addMinutes(20),
                ],
                [
                    'sender_id' => $secondUser->id,
                    'sender_type' => 'user',
                    'message' => 'hey',
                    'read' => true,
                    'created_at' => now()->subDays(1)->addHours(14)->addMinutes(25),
                ],
            ];

            foreach ($messages2 as $msgData) {
                Message::create(array_merge([
                    'conversation_id' => $conversation2->id,
                ], $msgData));
            }
        }

        $this->command->info('Successfully created conversations and messages!');
    }
}

