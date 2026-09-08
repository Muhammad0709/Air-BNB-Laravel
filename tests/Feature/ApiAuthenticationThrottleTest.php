<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ApiAuthenticationThrottleTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config(['cache.default' => 'array']);
        Http::preventStrayRequests();
    }

    public static function authenticationEndpoints(): array
    {
        return [
            'login' => ['/api/login', 60],
            // Existing social-login handler wraps validation failures as HTTP 500.
            'social login' => ['/api/social-login', 60, 500],
            'forgot password' => ['/api/password/forgot', 60],
            'reset password' => ['/api/password/reset', 60],
            'registration' => ['/api/register', 3600],
        ];
    }

    #[DataProvider('authenticationEndpoints')]
    public function test_authentication_attempts_are_limited_and_recover(string $endpoint, int $window, int $invalidStatus = 422): void
    {
        // Invalid input exercises the real routes without sending mail or calling providers.
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson($endpoint, [])->assertStatus($invalidStatus);
        }

        $response = $this->postJson($endpoint, []);
        $response->assertStatus(429)->assertHeader('Retry-After')
            ->assertJsonPath('message', 'Too many authentication attempts. Please try again later.');
        $this->assertGreaterThan(0, (int) $response->headers->get('Retry-After'));
        $this->assertLessThanOrEqual($window, (int) $response->headers->get('Retry-After'));

        $this->travel($window + 1)->seconds();
        $this->postJson($endpoint, [])->assertStatus($invalidStatus);
    }

    public function test_limits_are_isolated_by_ip_and_endpoint(): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/login', [])->assertUnprocessable();
        }
        $this->postJson('/api/login', [])->assertStatus(429);
        $this->postJson('/api/password/forgot', [])->assertUnprocessable();
        $this->withServerVariables(['REMOTE_ADDR' => '192.0.2.20'])
            ->postJson('/api/login', [])->assertUnprocessable();
        $this->getJson('/api/health')->assertOk();
    }
}
