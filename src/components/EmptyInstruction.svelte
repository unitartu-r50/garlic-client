<script>
    export let index = 0;

    let isMobile = false;

    $: isMobile = window.screen.width <= 1280;
</script>

<style>
    .instruction {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }

    @media (max-width: 800px) {
        .instruction {
            justify-content: normal;
        }
    }
</style>

<article class="instruction">
    <p>Question {index + 1}</p>
</article>

