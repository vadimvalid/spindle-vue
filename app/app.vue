<template>
  <div>
    <header>
      <nav aria-label="Main">
        <NuxtLink to="/">Chat</NuxtLink>
        <NuxtLink to="/generate">Generate</NuxtLink>
      </nav>
    </header>

    <main>
      <NuxtPage />
    </main>
  </div>
</template>

<style>
nav {
  display: flex;
  gap: 1rem;
  padding-block: 0.5rem;
}

/* NuxtLink adds this class to the link of the current route */
nav .router-link-active {
  font-weight: 600;
}
</style>
