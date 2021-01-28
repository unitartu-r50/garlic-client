<script>
    import {notify} from "./Helpers.svelte";
    import {serverIPStore} from "./stores";

    export let
        inAddMode,
        fetchNeeded;

    let motionName = "";
    let motionGroup = "";

    function addMotion(event) {
        const input = document.getElementById("new-motion-file");

        inAddMode = false;

        if (!input.files) {
            notify("negative", "please, attach a motion file")
            return;
        }

        console.log("file upload", motionName, motionGroup, input.files[0]);

        const reader = new FileReader();
        reader.addEventListener('loadend', (e) => {
            let data = new FormData();
            data.append("file_content", input.files[0]);
            data.append("name", motionName);
            data.append("group", motionGroup);

            fetch(`http://` + $serverIPStore + `:8080/api/upload/move`, {
                method: "POST",
                body: data
            })
                .then(response => response.json())
                .then((response) => {
                    console.log(response);
                    if (response["error"] && response["error"].length > 0) {
                        notify("negative", response["error"]);
                    } else {
                        notify("positive", response["message"]);
                        fetchNeeded = true;
                        motionName = "";
                        motionGroup = "";
                    }
                })
                .catch((err) => {
                    console.error(err);
                    notify("negative", err);
                })
        })
        reader.readAsText(input.files[0]);
    }

    function cancelForm(event) {
        inAddMode = false;
        motionName = "";
        motionGroup = "";
    }
</script>

<form class="my2">
    <fieldset class="mb1">
        <legend class="h5 m0 bold caps mb1">Adding a motion</legend>
        <label class="mb1" for="new-motion-name">Name
            <input id="new-motion-name" type="text" bind:value={motionName}>
        </label>
        <label class="mb1" for="new-motion-group">Group
            <input id="new-motion-group" type="text" bind:value={motionGroup}>
        </label>
        <label class="mb1" for="new-motion-file">File
            <input id="new-motion-file" type="file" accept=".qianim">
        </label>
        <button class="m0 mt2" on:click|preventDefault={addMotion}>Add</button>
        <button class="m0 mt2" on:click|preventDefault={cancelForm}>Cancel</button>
    </fieldset>
</form>
