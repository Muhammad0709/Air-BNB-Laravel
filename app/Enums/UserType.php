<?php

namespace App\Enums;

enum UserType: string
{
    case USER = 'User';
    case ADMIN = 'Admin';
    case HOST = 'Host';
}
