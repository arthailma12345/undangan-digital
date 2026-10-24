<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_id')->constrained()->restrictOnDelete();
            $table->string('slug')->unique();
            $table->string('title')->nullable();

            // Mempelai pria
            $table->string('groom_nickname');
            $table->string('groom_name');
            $table->string('groom_father')->nullable();
            $table->string('groom_mother')->nullable();
            $table->string('groom_child_order')->nullable(); // contoh: "Putra pertama"
            $table->string('groom_instagram')->nullable();
            $table->string('groom_photo')->nullable();

            // Mempelai wanita
            $table->string('bride_nickname');
            $table->string('bride_name');
            $table->string('bride_father')->nullable();
            $table->string('bride_mother')->nullable();
            $table->string('bride_child_order')->nullable();
            $table->string('bride_instagram')->nullable();
            $table->string('bride_photo')->nullable();

            $table->string('cover_photo')->nullable();
            $table->timestamp('event_date');           // dipakai untuk countdown
            $table->jsonb('events')->nullable();        // [{name,date,start_time,end_time,venue,address,maps_url}]
            $table->text('quote')->nullable();
            $table->string('quote_source')->nullable();
            $table->jsonb('love_stories')->nullable();  // [{year,title,story}]
            $table->jsonb('gallery')->nullable();       // [path, ...]
            $table->jsonb('gifts')->nullable();         // [{bank,number,holder}]
            $table->text('gift_address')->nullable();
            $table->string('music_url')->nullable();
            $table->string('livestream_url')->nullable();
            $table->text('closing_text')->nullable();

            $table->boolean('is_published')->default(true);
            $table->unsignedBigInteger('view_count')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
