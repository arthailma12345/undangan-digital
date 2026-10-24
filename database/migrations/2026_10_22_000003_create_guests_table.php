<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('code', 12)->unique();
            $table->string('phone')->nullable();
            $table->string('group')->nullable(); // Keluarga, Teman Kantor, dll
            $table->timestamp('opened_at')->nullable();
            $table->timestamps();
        });

        Schema::create('wishes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('guest_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('attendance', 10)->default('hadir'); // hadir | tidak | ragu
            $table->unsignedSmallInteger('pax')->default(1);
            $table->text('message')->nullable();
            $table->timestamps();

            $table->index(['invitation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wishes');
        Schema::dropIfExists('guests');
    }
};
