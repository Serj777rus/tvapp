<template>
  <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
  </router-view>
</template>

<script>

</script>

<style>
#app {
  font-family: "Comfortaa", sans-serif;
  line-height: 100%;
  background: rgb(23, 25, 29);
  color: #fff
}
@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@300..700&display=swap');

.comfortaa-app {
  font-family: "Comfortaa", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
}
.comfortaa-app {
  font-family: "Comfortaa", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}
.comfortaa-app {
  font-family: "Comfortaa", sans-serif;
  font-optical-sizing: auto;
  font-weight: 500;
  font-style: normal;
}
.comfortaa-app {
  font-family: "Comfortaa", sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: normal;
}
.comfortaa-app {
  font-family: "Comfortaa", sans-serif;
  font-optical-sizing: auto;
  font-weight: 700;
  font-style: normal;
}
</style>
