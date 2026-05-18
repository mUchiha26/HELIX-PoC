<?php
namespace App\Helpers;

class Validator
{
    private array $errors = [];

    public function required(string $field, mixed $value): self
    {
        if (empty($value) && $value !== '0') {
            $this->errors[$field] = "{$field} is required";
        }
        return $this;
    }

    public function email(string $field, mixed $value): self
    {
        if (!filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = "{$field} must be a valid email";
        }
        return $this;
    }

    public function minLength(string $field, mixed $value, int $min): self
    {
        if (strlen((string)$value) < $min) {
            $this->errors[$field] = "{$field} must be at least {$min} characters";
        }
        return $this;
    }

    public function passes(): bool
    {
        return empty($this->errors);
    }

    public function errors(): array
    {
        return $this->errors;
    }
}
