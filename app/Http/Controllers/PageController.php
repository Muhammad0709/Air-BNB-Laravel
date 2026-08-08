<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Enums\PropertyStatus;
use App\Http\Resources\BookingHistoryResource;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\ListingResource;
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

    public function bookingReceipt(string $id)
    {
        $booking = Booking::with('property:id,title,location')
            ->where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        return Inertia::render('BookingReceipt', [
            'receipt' => [
                'reference' => $booking->reference,
                'guest' => $booking->name ?: $booking->user?->name ?? '',
                'property' => $booking->property?->title ?? '',
                'propertyLocation' => $booking->property?->location ?? '',
                'checkin' => $booking->check_in_date->format('Y-m-d'),
                'checkout' => $booking->check_out_date->format('Y-m-d'),
                'nights' => $booking->nights,
                'nightlyRate' => (float) $booking->nightly_rate,
                'cleaningFee' => (float) $booking->cleaning_fee,
                'serviceFee' => (float) $booking->service_fee,
                'total' => (float) $booking->total_amount,
                'status' => $booking->status->value,
                'statusLabel' => $booking->status->label(),
                'paymentStatus' => $booking->payment_status,
                'bookedOn' => $booking->created_at->format('Y-m-d'),
                'depositAmount' => (float) $booking->deposit_amount,
                'depositStatus' => $booking->deposit_status?->value,
            ],
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

    public function search(Request $request)
    {
        $perPage = 12;
        $query = Property::with(['reviews'])
            ->where('status', 'Active')
            ->where('approval_status', PropertyStatus::APPROVED);

        if ($request->filled('location')) {
            $location = $request->input('location');
            $query->where(function ($q) use ($location) {
                $q->where('title', 'like', "%{$location}%")
                    ->orWhere('location', 'like', "%{$location}%")
                    ->orWhere('description', 'like', "%{$location}%");
            });
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        $guests = $request->input('guests');
        if ($request->filled('adults') || $request->filled('children')) {
            $adults = (int) $request->input('adults', 0);
            $children = (int) $request->input('children', 0);
            $guests = max(1, $adults + $children);
        }
        if ($guests !== null && $guests !== '' && (int) $guests >= 1) {
            $query->where('guests', '>=', (int) $guests);
        }

        $sortBy = $request->input('sort_by', 'featured');
        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'rating_high':
                $query->orderByRaw('(SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE reviews.property_id = properties.id) DESC');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $properties = $query->paginate($perPage)->withQueryString();
        $properties->getCollection()->transform(fn ($p) => (new ListingResource($p))->toArray($request));

        $checkin = $request->input('checkin');
        $checkout = $request->input('checkout');
        $nights = null;
        if ($checkin && $checkout) {
            $start = \Carbon\Carbon::parse($checkin);
            $end = \Carbon\Carbon::parse($checkout);
            $nights = max(1, (int) $start->diffInDays($end));
        }

        return Inertia::render('SearchResults', [
            'properties' => $properties,
            'filters' => $request->only([
                'location',
                'checkin',
                'checkout',
                'adults',
                'children',
                'rooms',
                'guests',
                'sort_by',
                'min_price',
                'max_price',
            ]),
            'nights' => $nights,
        ]);
    }

    public function welcome()
    {
        return Inertia::render('Welcome');
    }
}
