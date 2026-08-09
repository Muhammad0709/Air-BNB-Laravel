<?php

namespace App\Enums;

enum UserType: string
{
    case USER = 'User';
    case ADMIN = 'Admin';
    case HOST = 'Host';
    case MODERATOR = 'Moderator';
    case COMPANY = 'Company';

    public function isHostPanelUser(): bool
    {
        return $this === self::HOST || $this === self::COMPANY;
    }
}
