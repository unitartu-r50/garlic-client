<script>
    export let title, description;
</script>

<style>
    p {
        max-width: 80ch;
        line-height: 1.25em;
    }
</style>

<section class="px2 my2">
    <h1 class="h1 m0">{title}</h1>
    <p>{description}</p>
    <slot/>
</section>