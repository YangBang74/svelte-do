<script lang="ts">
  import { onMount } from 'svelte';
  import { db, type Task } from '$lib/db';
  import { fade } from 'svelte/transition';

  let title = '';
  let tasks: Task[] = [];
  let editingId: number | null = null;
  let editedTitle = '';
  let searchQuery = '';

  async function loadTasks() {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const allTasks = await db.tasks.orderBy('createdAt').reverse().toArray();
      tasks = allTasks.filter(task => task.title.toLowerCase().includes(query));
    } else {
      tasks = await db.tasks.orderBy('createdAt').reverse().toArray();
    }
  }

  async function addTask() {
    if (!title.trim()) return;

    await db.tasks.add({
      title: title.trim(),
      status: 'active',
      createdAt: new Date()
    });

    title = '';
    await loadTasks();
  }

  async function deleteTask(id: number) {
    await db.tasks.delete(id);
    await loadTasks();
  }

  function startEdit(task: Task) {
    editingId = task.id!;
    editedTitle = task.title;
  }

  async function saveEdit(id: number) {
    if (!editedTitle.trim()) return;

    await db.tasks.update(id, {
      title: editedTitle.trim()
    });

    editingId = null;
    await loadTasks();
  }

  function cancelEdit() {
    editingId = null;
  }

  onMount(loadTasks);
</script>

<div class="mx-auto flex min-h-screen max-w-2xl flex-col bg-gray-50 text-sm">
  <!-- Поиск -->
  <div class="sticky top-0 z-10 bg-gray-50 px-3 pt-4 pb-1 shadow-sm">
    <input
      type="text"
      bind:value={searchQuery}
      on:input={loadTasks}
      placeholder="Поиск задач..."
      class="w-full rounded-lg border border-gray-300 bg-white px-3 py-1 shadow-sm transition focus:border-blue-400 focus:ring focus:outline-none"
      in:fade={{ duration: 200 }}
    />
  </div>

  <!-- Список задач -->
  <ul class="flex-1 space-y-2 overflow-y-auto px-3 py-3">
    {#each tasks as task (task.id)}
      <li
        transition:fade={{ duration: 300 }}
        class="flex flex-col items-start justify-between gap-2 rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition hover:shadow-md sm:flex-row"
      >
        {#if editingId === task.id}
          <div class="w-full space-y-1">
            <input
              bind:value={editedTitle}
              placeholder="Название"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm transition focus:outline-none"
              required
            />
            <div class="mt-1 flex gap-2">
              <button
                on:click={() => saveEdit(task.id!)}
                class="rounded-md bg-green-500 px-3 py-1 text-white transition hover:bg-green-600"
              >
                Сохранить
              </button>
              <button
                on:click={cancelEdit}
                class="rounded-md bg-gray-200 px-3 py-1 text-gray-700 transition hover:bg-gray-300"
              >
                Отмена
              </button>
            </div>
          </div>
        {:else}
          <div class="w-full">
            <h3 class="text-base font-semibold text-gray-800">{task.title}</h3>
          </div>
          <div class="flex gap-1 sm:flex-col sm:gap-1">
            <button
              on:click={() => startEdit(task)}
              class="rounded-md bg-blue-100 px-2 py-0.5 text-blue-700 transition hover:bg-blue-200"
            >
              Редактировать
            </button>
            <button
              on:click={() => deleteTask(task.id!)}
              class="rounded-md bg-red-100 px-2 py-0.5 text-red-700 transition hover:bg-red-200"
            >
              Удалить
            </button>
          </div>
        {/if}
      </li>
    {/each}
  </ul>

  <!-- Форма добавления задачи (внизу) -->
  <form
    on:submit|preventDefault={addTask}
    class="sticky bottom-0 z-10 border-t bg-gray-50 px-3 py-4 shadow-inner"
  >
    <div class="space-y-2">
      <input
        type="text"
        bind:value={title}
        placeholder="Новая задача..."
        class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm transition focus:border-blue-400 focus:ring focus:outline-none"
        required
      />
      <button
        type="submit"
        class="w-full rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
      >
        Добавить задачу
      </button>
    </div>
  </form>
</div>
