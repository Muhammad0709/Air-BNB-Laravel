<?php

namespace Tests\Feature;

use App\Enums\PropertyStatus;
use App\Enums\PropertyType;
use App\Enums\UserType;
use App\Models\Property;
use App\Models\User;
use App\Models\Booking;
use Tests\TestCase;

class ProviderWorkflowTest extends TestCase
{
    public function test_company_api_registration_requires_details_and_starts_pending(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Acme Company',
            'email' => 'acme@example.com',
            'password' => 'Password1!',
            'type' => UserType::COMPANY->value,
            'company_name' => 'Acme Company Ltd',
            'tax_id' => 'TAX-123',
            'company_registration_number' => 'REG-123',
            'company_registered_address' => '1 Main Street',
            'company_contact_person' => 'Jane Doe',
            'company_description' => 'A verified accommodation provider.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.type', UserType::COMPANY->value)
            ->assertJsonPath('data.user.provider_verification_status', 'pending');

        $this->assertDatabaseHas('users', [
            'email' => 'acme@example.com',
            'type' => UserType::COMPANY->value,
            'provider_verification_status' => 'pending',
            'company_registration_number' => 'REG-123',
        ]);
    }

    public function test_public_api_cannot_self_register_admin_or_moderator(): void
    {
        foreach ([UserType::ADMIN, UserType::MODERATOR] as $type) {
            $this->postJson('/api/register', [
                'name' => $type->value . ' Account',
                'email' => strtolower($type->value) . '@example.com',
                'password' => 'Password1!',
                'type' => $type->value,
            ])->assertUnprocessable();
        }
    }

    public function test_pending_provider_can_prepare_properties_but_cannot_access_earnings_api(): void
    {
        $provider = User::factory()->create([
            'type' => UserType::HOST,
            'provider_verification_status' => 'pending',
        ]);
        $token = $provider->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/host/properties')
            ->assertOk();

        $this->withToken($token)
            ->getJson('/api/host/earnings')
            ->assertForbidden();
    }

    public function test_customer_host_preview_is_read_only(): void
    {
        $customer = User::factory()->create(['type' => UserType::USER]);

        $this->actingAs($customer)
            ->withSession(['host_panel_preview' => true])
            ->post('/host/properties', [])
            ->assertForbidden();
    }

    public function test_revoking_provider_verification_unpublishes_approved_properties(): void
    {
        $admin = User::factory()->create(['type' => UserType::ADMIN]);
        $provider = User::factory()->create([
            'type' => UserType::HOST,
            'provider_verification_status' => 'verified',
        ]);
        $property = Property::create([
            'title' => 'Verified Villa',
            'location' => 'Lahore, Pakistan',
            'price' => 100,
            'bedrooms' => 2,
            'bathrooms' => 1,
            'guests' => 4,
            'property_type' => PropertyType::VILLA->value,
            'status' => 'Active',
            'approval_status' => PropertyStatus::APPROVED->value,
            'description' => 'A verified listing.',
            'user_id' => $provider->id,
        ]);

        $this->actingAs($admin)
            ->patch(route('admin.hosts.verification', $provider), [
                'provider_verification_status' => 'suspended',
            ])
            ->assertRedirect();

        $this->assertSame(PropertyStatus::PENDING->value, $property->fresh()->approval_status);
    }

    public function test_booking_persists_payment_method(): void
    {
        $customer = User::factory()->create(['type' => UserType::USER]);
        $provider = User::factory()->create([
            'type' => UserType::HOST,
            'provider_verification_status' => 'verified',
        ]);
        $property = Property::create([
            'title' => 'Payment Villa',
            'location' => 'Lahore, Pakistan',
            'price' => 100,
            'bedrooms' => 2,
            'bathrooms' => 1,
            'guests' => 4,
            'property_type' => PropertyType::VILLA->value,
            'status' => 'Active',
            'approval_status' => PropertyStatus::APPROVED->value,
            'description' => 'A payment test listing.',
            'user_id' => $provider->id,
        ]);

        $booking = Booking::create([
            'property_id' => $property->id,
            'user_id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => '03001234567',
            'check_in_date' => '2026-10-01',
            'check_out_date' => '2026-10-03',
            'total_amount' => 200,
            'nightly_rate' => 100,
            'nights' => 2,
            'payment_method' => 'online_mpesa',
        ]);

        $this->assertSame('online_mpesa', $booking->fresh()->payment_method);
    }
}
