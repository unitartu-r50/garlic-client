<script>
    import {notify} from "../Helpers.svelte";
    import { afterUpdate } from 'svelte';
    import Select from "svelte-select";
    import { motionsFetchNeeded } from '../stores'

    export let inPresentationMode,
               inEditMode,
               currentSession = null,
               isFetchNeeded,
               currentPresentationItem,
               currentPresentationItemIndex;
    
    let sessions = [];
    let sessions_list = [];
    let selectItem;
    let currentSessionIndex = 0;

    // If another client changes server state, the session index stored in the browser might be wrong
    if (window.localStorage.getItem("currentSessionIndex")) {
        currentSessionIndex = window.localStorage.getItem("currentSessionIndex")
    }
    else {
        setCurrentSessionIndex(0);
    }

    $: {
        if (isFetchNeeded) {
            fetchSessions();
        }
    }

    function fetchSessions() {
        fetch(`http://` + window.location.hostname + `:8080/api/sessions/`)
            .then(r => r.json())
            .then(d => {
                sessions = d.sessions;
                if (currentSessionIndex >= sessions.length) {
                    setCurrentSessionIndex(0);
                }
                if (!currentSession || (currentSession && !currentSession.ID)) {
                    currentSession = sessions[currentSessionIndex];
                }
                sessions_list = [];
                for (let index = 0; index < sessions.length; index ++) {
                    sessions_list.push({value: index, label: sessions.at(index).Name})
                }
                if (currentSession && currentSessionIndex) {
                    selectItem = {value: currentSessionIndex, label: currentSession.Name};
                }
                if (sessions.length === 0) {
                    selectItem = null;
                }
                isFetchNeeded = false;
            })
            .catch(err => {
                console.error("error:", err);
                isFetchNeeded = false;
            });
    }

    function add() {
        let session = {
            "Name": "New Session",
            "Items": [{
                "Actions": [],
            }]
        };
        sessions.push(session);
        sessions = sessions;
        currentSessionIndex = sessions.length - 1;
        currentSession = sessions[currentSessionIndex];
        selectItem = {value: currentSessionIndex+1, label: currentSession.Name}
        inEditMode = true;
    }

    function save() {
        if (!currentSession["ID"] || currentSession["ID"].length === 0) {
            console.log("posting a new session", currentSession);
            fetch(`http://` + window.location.hostname + `:8080/api/sessions/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(currentSession)
            })
                .then(r => {
                    if (!r.ok) {
                        throw Error(r.statusText);
                    }
                    return r.json();
                })
                .then(r => {
                    notify("positive", r.message);
                    currentSession = null;
                    inEditMode = false;
                    isFetchNeeded = true;
                })
                .catch(err => {
                    console.error(err);
                    notify("negative", err);
                })
        } else {
            console.log("saving session", currentSession);
            fetch(`http://` + window.location.hostname + `:8080/api/sessions/${currentSession["ID"]}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                mode: "cors",
                redirect: "follow",
                body: JSON.stringify(currentSession)
            })
                .then(r => {
                    if (!r.ok) {
                        throw Error(r.statusText);
                    }
                    return r.json();
                })
                .then(r => {
                    notify("positive", r.message);
                    currentSession = null;
                    inEditMode = false;
                    isFetchNeeded = true;
                })
                .catch(err => {
                    console.error(err);
                    notify("negative", err);
                })
        }
    }

    function cancelEdit() {
        let confirmation = window.confirm(`Are you sure you want to cancel? Unsaved changes will be discarded!`);
        if (!confirmation) {
            return;
        }
        inEditMode = false;
        inPresentationMode = true;
        currentSession = null;
        isFetchNeeded = true;
    }

    function edit() {
        inEditMode = true;
        inPresentationMode = false;
        $motionsFetchNeeded = true;
    }

    function remove() {
        if (!currentSession.ID) {
            inEditMode = false;
            currentSession = null;
            currentSessionIndex = null;
            window.localStorage.setItem("currentSessionIndex", null);
            selectItem = null;
            sessions.pop();
        }
        else {
            let confirmation = window.confirm(`Are you sure you want to remove the session: ${currentSession.Name}?`);
            if (!confirmation) {
                return;
            }

            fetch(`http://` + window.location.hostname + `:8080/api/sessions/${currentSession.ID}`, {
                method: "DELETE",
                mode: "cors",
                redirect: "follow",
                body: JSON.stringify(currentSession)
            })
            .then(r => {
                if (!r.ok) {
                    throw Error(r.statusText);
                }
                return r.json();
            })
            .then(r => {
                notify("positive", r.message);
                inEditMode = false;
                currentSession = null;
                sessions = [];
                currentSessionIndex = 0;
                window.localStorage.setItem("currentSessionIndex", 0);
                selectItem = sessions_list[0];
                isFetchNeeded = true;
            })
            .catch(err => {
                console.error(err);
                notify("negative", err);
            })
        }
    }

    function importSession() {
        const el = document.getElementById("import-session-file");
        if (!el) {
            console.error("can't find #import-session-file in the document");
            return
        }

        const reader = new FileReader();
        reader.addEventListener('load', (e) => {
            let data = new FormData();
            data.append("file_content", el.files[0]);

            fetch('http://' + window.location.hostname + ':8080/api/upload/session', {
                method: "POST",
                body: data
            })
                .then(r => {
                    if (!r.ok) {
                        if (r["error"] && r["error"].length > 0) {
                            notify("negative", r["error"]);
                        }
                        throw Error(r.statusText);
                    }
                    return r.json();
                })
                .then(r => {
                    console.log(r);
                    notify("positive", r.message);
                    el.value = "";
                    currentSessionIndex = sessions.length;
                    currentSession = null;
                    isFetchNeeded = true;
                })
                .catch(err => {
                    console.error(err);
                    notify("negative", err);
                })
        })
        reader.readAsArrayBuffer(el.files[0]);
    }

    function exportSession() {
        if (currentSession == null) {
            return;
        }

        fetch(`http://` + window.location.hostname + `:8080/api/session_export/${currentSession.ID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(r => {
                if (!r.ok) {
                    throw Error(r.statusText);
                }
                return r.json();
            })
            .then(r => {
                notify("positive", r.message);
                window.open(`http://` + window.location.hostname + `:8080/${r.relative_path}`);
            })
            .catch(err => {
                console.error(err);
                notify("negative", err);
            });
    }

    function setCurrentSessionIndex(index) {
        currentSessionIndex = index;
        window.localStorage.setItem("currentSessionIndex", currentSessionIndex);
    }

    afterUpdate(() => {
        if (!selectItem && sessions_list && currentSession) {
            selectItem = {value: currentSessionIndex, label: currentSession.Name}
        }
    })

    function handleChange() {
        setCurrentSessionIndex(selectItem.value);
        currentSession = sessions[currentSessionIndex];
        currentPresentationItemIndex = 0;
    }

    function nextQuestion() {
        currentPresentationItemIndex += 1;
        if (currentPresentationItemIndex >= currentSession.Items.length) {
            currentPresentationItemIndex = currentSession.Items.length - 1;
            console.log("already the last question in the list");
            return;
        }
        currentPresentationItem = currentSession.Items[currentPresentationItemIndex];
    }

    function previousQuestion() {
        currentPresentationItemIndex -= 1;
        if (currentPresentationItemIndex < 0) {
            currentPresentationItemIndex = 0;
            console.log("already the first question in the list");
            return;
        }
        currentPresentationItem = currentSession.Items[currentPresentationItemIndex];
    }

    fetchSessions();
</script>
<style>
    .mode-label {
        font-weight: normal;
        color: rgba(159, 241, 255, 1);
        display: inline-flex;
        margin-top: 5px;
    }
    .ui.file.input {
        top: -999999px;
        position: absolute;
    }
</style>
<div>
    <div style="display: flex; justify-content: space-between;">
        {#if !inEditMode}
            <span style="font-weight: bold; font-size: 20px; width: 30%;">
                <Select id="session-select" items={sessions_list} showIndicator={true} isDisabled={!sessions_list} bind:value={selectItem} on:select={handleChange} isClearable={false}
                        containerStyles="listAudoWidth{false}" listOffset={0} placeholder="Select a session..."></Select>
            </span>
        {:else}
            <span class="ui labeled input" style="font-size: 15px; margin-top: 1px;">
                <span class="ui label">Session name:</span>
                <input type="text" bind:value={currentSession.Name}>
            </span>
        {/if}
        <h2 class="mode-label">
            {#if inPresentationMode}
                Presentation Mode
            {:else if inEditMode}
                Edit Mode
            {:else}
                Detailed Mode
            {/if}
        </h2>
    </div>
</div>
<div class="ui clearing divider"></div>
<div style="display: flex; justify-content: space-between;">
    <span>
        <span data-tooltip={inEditMode ? "Finish editing first!" : null} data-inverted="" class="display: inline">
            <button class="ui{inEditMode === true ? ' disabled' : ''} button" on:click|preventDefault={add}>Create session</button>
        </span>
        <span data-tooltip={inEditMode ? "Finish editing first!" : null} data-inverted="" class="display: inline">
            <form class="ui form" style="display: inline;">
                <label for="import-session-file" class="ui{inEditMode === true ? ' disabled' : ''} icon button">
                    <i class="upload icon"></i>
                    Import session
                </label>
                <input type="file" id="import-session-file" class="ui file input"
                       accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed" on:change={importSession}>
            </form>
        </span>
        {#if !sessions && sessions.length === 0}
            <p><em>No sessions found.</em></p>
        {:else}
            {#if currentSession}
                {#if inPresentationMode}
                    <button class="ui button" on:click|preventDefault={() => {inPresentationMode = !inPresentationMode}}>Detailed mode</button>
                {:else}
                    {#if inEditMode}
                    <button class="ui button" on:click={save}>Save</button>
                    <button class="ui button" on:click={cancelEdit}>Cancel</button>
                    {:else}
                        <button class="ui button" on:click|preventDefault={() => {inPresentationMode = !inPresentationMode}}>Presentation mode</button>
                        <button class="ui button" on:click={edit}>Edit</button>
                    {/if}
                    <button class="ui button" on:click|preventDefault={remove} data-id="{currentSession.ID}" data-name="{currentSession.Name}">Remove</button>
                    {#if !inEditMode}
                        <span data-tooltip="Coming soon!" data-inverted="" class="display: inline">
                            <button class="ui disabled button" on:click|preventDefault={exportSession}>Export</button>
                        </span>
                    {/if}
                {/if}
            {/if}
        {/if}
    </span>
    {#if inPresentationMode}
        <span>
            <button on:click|preventDefault={previousQuestion} class="ui icon button"><i class="arrow left icon"></i></button>
            <button on:click|preventDefault={nextQuestion} class="ui icon button"><i class="arrow right icon"></i></button>
        </span>
    {/if}
</div>
