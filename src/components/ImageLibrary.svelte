<script>
    import {sendInstruction, notify} from './Helpers.svelte'

    function showImage() {
        console.log("showing an image");
    }
</script>

<style></style>

<div class="mb4">
    <h2 class="h2 m0 mb1">Image Library</h2>
    <button on:click|preventDefault={sendInstruction}>Show image</button>
</div>