<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\PropertyStatus;
use App\Http\Resources\BookingHistoryResource;
use App\Http\Resources\ConversationResource;
use App\Models\Booking;
use App\Models\Conversation;
use App\Models\Property;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PageController extends Controller
{
    public function about()
    {
        return Inertia::render('About');
    }

    public function chat(Request $request)
    {
        $conversations = Conversation::where('user_id', Auth::id())
            ->with(['property.user', 'lastMessage.files'])
            ->orderBy('updated_at', 'desc')
            ->get();

        $conversationsData = ConversationResource::collection($conversations)->toArray($request);

        // Hosts/properties user can message (jis host ki property hai wo show ho)
        $propertiesToMessage = Property::where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED)
            ->with('user')
            ->orderBy('title')
            ->limit(100)
            ->get()
            ->map(function ($property) {
                $host = $property->user;
                $hostAvatar = null;
                if ($host && $host->profile_picture) {
                    $hostAvatar = filter_var($host->profile_picture, FILTER_VALIDATE_URL)
                        ? $host->profile_picture
                        : asset(Storage::url($host->profile_picture));
                }
                return [
                    'propertyId' => $property->id,
                    'property' => $property->title,
                    'hostName' => $host->name ?? 'Unknown',
                    'hostAvatar' => $hostAvatar,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Chat', [
            'conversations' => $conversationsData['data'] ?? $conversationsData,
            'propertiesToMessage' => $propertiesToMessage,
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                ] : null,
            ],
        ]);
    }

    public function customerBookings(Request $request)
    {
        $userId = Auth::id();

        $upcoming = Booking::with('property')
            ->where('user_id', $userId)
            ->whereIn('status', BookingStatus::upcoming())
            ->latest()
            ->paginate(5, ['*'], 'upcoming_page');
        $upcoming->through(fn ($b) => (new BookingHistoryResource($b))->toArray($request));

        $past = Booking::with('property')
            ->where('user_id', $userId)
            ->whereIn('status', BookingStatus::past())
            ->latest()
            ->paginate(5, ['*'], 'past_page');
        $past->through(fn ($b) => (new BookingHistoryResource($b))->toArray($request));

        return Inertia::render('CustomerBookings', [
            'upcoming' => $upcoming,
            'past' => $past,
        ]);
    }

    public function privacyPolicy()
    {
        return Inertia::render('PrivacyPolicy');
    }

    public function terms()
    {
        return Inertia::render('TermsOfService');
    }

    public function search()
    {
        return Inertia::render('SearchResults');
    }

    public function welcome()
    {
        return Inertia::render('Welcome');
    }
}
