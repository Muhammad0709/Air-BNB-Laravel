<?php

namespace App\Http\Controllers;

use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        return Inertia::render('Chat', [
            'conversations' => $conversationsData['data'] ?? $conversationsData,
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                ] : null,
            ],
        ]);
    }

    public function customerBookings()
    {
        return Inertia::render('CustomerBookings');
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
