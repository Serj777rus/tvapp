<template>
    <div class="navbar">
        <font-awesome-icon :icon="['fas', 'house']" style="color: #74C0FC; font-size: 24px;" />
        <font-awesome-icon :icon="['fas', 'download']" style="color: #74C0FC; font-size: 24px;" />
        <font-awesome-icon :icon="['fas', 'paper-plane']" style="color: #74C0FC; font-size: 24px;" />
        <font-awesome-icon :icon="['fas', 'folder-open']" style="color: #74C0FC; font-size: 24px;" />
    </div>
</template>

<script>
    export default {
        
    }
</script>

<style scoped>
.navbar {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    padding: 24px 0px;
    position: fixed;
    bottom: 0;
    left: 0;
    background: linear-gradient(0deg, rgba(23, 25, 29, 1.0), rgba(23, 25, 29, 1.0), rgba(23, 25, 29, 1.0), rgba(23, 25, 29, .8));
    z-index: 999;
}
</style>