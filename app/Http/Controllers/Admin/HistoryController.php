<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HistoryController extends Controller
{
    private function commissionRate(): float
    {
        return (float) (Setting::get('commission_rate', 10) / 100);
    }

    private function bookingRow(Booking $b): array
    {
        $total = (float) $b->total_amount;
        $rate = $this->commissionRate();
        $commission = $total * $rate;
        $hostEarning = $total - $commission;

        return [
            'id' => $b->id,
            'customer' => $b->name ?: $b->user?->name ?? '—',
            'nights' => $b->nights,
            'property' => $b->property?->title ?? '—',
            'total_amount' => $total,
            'total_amount_formatted' => '$' . number_format($total, 2),
            'commission' => round($commission, 2),
            'commission_formatted' => '$' . number_format($commission, 2),
            'host_earning' => round($hostEarning, 2),
            'host_earning_formatted' => '$' . number_format($hostEarning, 2),
        ];
    }

    public function index(Request $request)
    {
        $perPage = 10;
        $page = max(1, (int) $request->input('page', 1));

        $bookings = Booking::query()
            ->with(['property.user', 'user'])
            ->where('status', BookingStatus::COMPLETED)
            ->orderByDesc('created_at')
            ->get();

        $byHost = [];
        $totalAdminCommission = 0.0;
        $totalHostEarning = 0.0;

        /** @var Booking $b */
        foreach ($bookings as $b) {
            $hostId = $b->property?->user_id;
            if (!$hostId) {
                continue;
            }
            $host = $b->property->user;
            $hostName = $host->name ?? 'Unknown';
            if (!isset($byHost[$hostId])) {
                $byHost[$hostId] = [
                    'host_id' => $hostId,
                    'host_name' => $hostName,
                    'bookings' => [],
                    'total_amount' => 0.0,
                    'total_commission' => 0.0,
                    'total_host_earning' => 0.0,
                ];
            }
            $row = $this->bookingRow($b);
            $byHost[$hostId]['bookings'][] = $row;
            $byHost[$hostId]['total_amount'] += $row['total_amount'];
            $byHost[$hostId]['total_commission'] += $row['commission'];
            $byHost[$hostId]['total_host_earning'] += $row['host_earning'];
            $totalAdminCommission += $row['commission'];
            $totalHostEarning += $row['host_earning'];
        }

        $hostsAll = array_values(array_map(function ($h) {
            $h['total_amount_formatted'] = '$' . number_format($h['total_amount'], 2);
            $h['total_commission_formatted'] = '$' . number_format($h['total_commission'], 2);
            $h['total_host_earning_formatted'] = '$' . number_format($h['total_host_earning'], 2);
            $h['bookings_count'] = count($h['bookings']);
            return $h;
        }, $byHost));

        if ($request->filled('search')) {
            $search = strtolower($request->input('search'));
            $hostsAll = array_values(array_filter($hostsAll, fn ($h) => str_contains(strtolower((string) $h['host_name']), $search)));
        }

        $total = count($hostsAll);
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = min($page, $lastPage);
        $offset = ($page - 1) * $perPage;
        $hosts = array_slice($hostsAll, $offset, $perPage);

        return Inertia::render('Admin/History/Index', [
            'hosts' => $hosts,
            'current_page' => $page,
            'last_page' => $lastPage,
            'filters' => $request->only(['search']),
        ]);
    }

    public function show(User $user)
    {
        $bookings = Booking::query()
            ->with(['property', 'user'])
            ->whereHas('property', fn ($q) => $q->where('user_id', $user->id))
            ->where('status', BookingStatus::COMPLETED)
            ->orderByDesc('created_at')
            ->get();

        $rows = [];
        $totalCommission = 0.0;
        $totalHostEarning = 0.0;
        /** @var Booking $b */
        foreach ($bookings as $b) {
            $row = $this->bookingRow($b);
            $rows[] = $row;
            $totalCommission += $row['commission'];
            $totalHostEarning += $row['host_earning'];
        }

        return Inertia::render('Admin/History/Show', [
            'host' => [
                'id' => $user->id,
                'name' => $user->name ?? 'Unknown',
            ],
            'bookings' => $rows,
            'total_commission' => round($totalCommission, 2),
            'total_commission_formatted' => '$' . number_format($totalCommission, 2),
            'total_host_earning' => round($totalHostEarning, 2),
            'total_host_earning_formatted' => '$' . number_format($totalHostEarning, 2),
        ]);
    }
}
