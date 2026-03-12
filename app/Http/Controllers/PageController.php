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
        $search = $request->search;
        
        $conversations = Conversation::where('user_id', Auth::id())
            ->with(['property.user', 'lastMessage.files'])
            ->when($search, function ($q) use ($search) {
                $q->where(function ($query) use ($search) {
                    $query->whereHas('property', function ($pq) use ($search) {
                        $pq->where('title', 'like', "%{$search}%");
                    })
                    ->orWhereHas('property.user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('lastMessage', function ($mq) use ($search) {
                        $mq->where('message', 'like', "%{$search}%");
                    });
                });
            })
            ->orderBy('updated_at', 'desc')
            ->get();

        return Inertia::render('Chat', [
            'conversations' => ConversationResource::collection($conversations)->toArray($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                ] : null,
            ],
        ]);
    }

    public function deleteConversation(Conversation $conversation)
    {
        if ($conversation->user_id !== Auth::id()) {
            abort(403);
        }
        $conversation->delete();
        return response()->noContent();
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
