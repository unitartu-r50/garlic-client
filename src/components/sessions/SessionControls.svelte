<script>
    import {notify} from "../Helpers.svelte";
    import { markInactive } from "../Instruction.svelte";
    import { afterUpdate } from 'svelte';
    import Select from "svelte-select";
    import { pepperConnectionID, motionsFetchNeeded, speaker, recording } from '../stores';

    export let inPresentationMode,
               inEditMode,
               currentSession = null,
               isFetchNeeded,
               currentPresentationItem,
               currentPresentationItemIndex;
    
    let voices = [];
    let currentVoiceIndex = 0;
    let selectVoice = null;
    let sessions = [];
    let sessions_list = [];
    let selectItem;
    let currentSessionIndex = 0;
    let forceCurrentSessionReload = false;
    let rec_paused = false;

    if (window.localStorage.getItem("currentSessionIndex")) {
        currentSessionIndex = window.localStorage.getItem("currentSessionIndex")
    } else {
        setCurrentSessionIndex(0);
    }

    $: {
        if (isFetchNeeded) {
            fetchSessions(forceCurrentSessionReload);
        }
    }

    function fetchSessions(force_reload_current) {
        fetch(`http://` + window.location.hostname + `:8080/api/sessions/`)
            .then(r => r.json())
            .then(d => {
                sessions = d.sessions;
                if (currentSessionIndex >= sessions.length) {
                    setCurrentSessionIndex(0);
                }
                if (force_reload_current || !currentSession || (currentSession && !currentSession.ID)) {
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
            })
            .catch(err => {
                console.error("error:", err);
            })
            .finally(() => {
                isFetchNeeded = false;
                forceCurrentSessionReload = false;
            })
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
        selectItem = null;
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
            let confirmation = window.confirm(`Are you sure you want to remove ${currentSession.Name}?`);
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
                selectItem = null;
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
        let filename = el.files[0].name;
        if (!filename.endsWith(".zip")) {
            notify("negative", "Please upload a session in ZIP format.")
            return;
        }
        let name = filename.replace('.zip', '');

        for (let index = 0; index < sessions.length; index++) {
            if (sessions.at(index).Name === name) {
                let confirmation = window.confirm('A session with this name already exists! Overwrite?');
                if (!confirmation) {
                    return;
                }
                break;
            }
        }
        console.log(el.files[0])

        jQuery('#import-dimmer').dimmer({closable:false}).dimmer('show');
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
                    if (r['error']) {
                        notify("negative", r.error);
                    } else {
                        notify("positive", r.message);
                        el.value = "";
                        console.log(r);
                        currentSessionIndex = r.session_index;
                        console.log(currentSessionIndex);
                        currentSession = null;
                        isFetchNeeded = true;
                    }
                })
                .catch(err => {
                    console.error(err);
                    notify("negative", err);
                })
                .finally(() => {
                    jQuery('#import-dimmer').dimmer('hide');
                })
        })
        reader.readAsArrayBuffer(el.files[0]);
    }

    function exportSession() {
        if (currentSession == null) {
            return;
        }

        fetch('http://' + window.location.hostname + `:8080/api/export_session/${currentSession.ID}`, {
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
                window.open('http://' + window.location.hostname + `:8080/${r.relative_path}`);
            })
            .catch(err => {
                console.error(err);
                notify("negative", err);
            });
    }

    function confirmBatchSynthesis() {
        jQuery('#synthesis-modal').modal('show');
    }

    function batchSynthesis() {
        jQuery('#batch-dimmer').dimmer({closable:false}).dimmer('show');
        fetch(`http://` + window.location.hostname + ':8080/api/synthesis/batch?' + new URLSearchParams({voice: selectVoice.label}), {
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
                inEditMode = false;
                forceCurrentSessionReload = true;
                isFetchNeeded = true;
            })
            .catch(err => {
                console.error(err);
                notify("negative", err);
            })
            .finally(() => {
                jQuery('#batch-dimmer').dimmer('hide');
            })
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

    function handleSessionChange() {
        setCurrentSessionIndex(selectItem.value);
        currentSession = sessions[currentSessionIndex];
        currentPresentationItemIndex = 0;
        var instructions = document.getElementsByClassName("instruction");
        for (var i=0; i < instructions.length; i++) {
            markInactive(instructions.item(i));
        }
    }

    function handleVoiceChange() {
        currentVoiceIndex = selectVoice.value;
        window.localStorage.setItem("currentVoiceIndex", currentVoiceIndex);
        $speaker = voices[currentVoiceIndex].label;
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

    function record_session() {
        fetch('http://' + window.location.hostname + ':8080/api/recording/start?' + new URLSearchParams({'conn': $pepperConnectionID}))
            .then(response => response.json())
            .then((r) => {
                if (r['error']) {
                    notify("negative", r['error']);
                } else {
                    $recording = true;
                    notify("positive", r['message']);
                }
            });
    }

    function pause_recording() {
        console.log("WIP");
        rec_paused = true;
    }

    function resume_recording() {
        console.log("WIP");
        rec_paused = false;
    }

    function stop_recording() {
        fetch('http://' + window.location.hostname + ':8080/api/recording/stop?' + new URLSearchParams({'conn': $pepperConnectionID}))
            .then(response => response.json())
            .then((r) => {
                if (r['error']) {
                    notify("negative", r['error']);
                } else {
                    $recording = false;
                    notify("positive", r['message']);
                }
            });
    }

    fetchSessions(false);

    fetch('http://' + window.location.hostname + ':8080/api/voices')
        .then(r => r.json())
        .then(d => {
            for (let index = 0; index < d['voices'].length; index ++) {
                    voices.push({value: index, label: d['voices'].at(index)})
                }
            if (window.localStorage.getItem("currentVoiceIndex")) {
                currentVoiceIndex = window.localStorage.getItem("currentVoiceIndex");
            } else {
                currentVoiceIndex = 0;
                window.localStorage.setItem("currentVoiceIndex", 0);
            }
            selectVoice = voices[currentVoiceIndex];
            $speaker = selectVoice.label;
        })
        .catch(err => {
            console.error("Error fetching voices: ", err)
        });
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
    .mode-button {
        background-color: #c0c1c2;
    }
</style>
<div class="ui page dimmer" id="batch-dimmer">
    <div class="content">
        <i class="asterisk loading icon"></i>Synthesizing, please wait...
    </div>
</div>
<div class="ui page dimmer" id="import-dimmer">
    <div class="content">
        <i class="asterisk loading icon"></i>Importing session, please wait...
    </div>
</div>
<div class="ui basic modal" id="synthesis-modal">
    <div class="ui icon header">
        <i class="wave square icon"></i>
        Batch synthesis
    </div>
    <div class="content">
        <p>You are about to re-synthesize all voicelines, replacing them. This process may take several minutes and can not be reversed. Proceed?
    </div>
    <div class="actions" style="display: flex; justify-content: space-between;">
        <button class="ui green ok inverted button" on:click={batchSynthesis}>
            <i class="checkmark icon"></i>Yes
        </button>
        <span class="ui red basic cancel inverted button">
            <i class="remove icon"></i>No
        </span>
    </div>
</div>
<div>
    <div style="display: flex; justify-content: space-between;">
        {#if !inEditMode}
            <span style="font-weight: bold; font-size: 20px; width: 30%;">
                <Select id="session-select" items={sessions_list} showIndicator={true} isDisabled={!sessions_list} bind:value={selectItem} on:select={handleSessionChange}
                    isClearable={false} listOffset={0} listPlacement={'bottom'} placeholder="Select a session..."></Select>
            </span>
        {:else}
            <span class="ui labeled input">
                <span class="ui label" style="font-size: 15px;">Session name:</span>
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
<div class="ui clearing divider" style="margin: 8px 0 5px 0;"></div>
<div style="display: flex; justify-content: space-between; flex-wrap: nowrap;">
    <span style="margin-top: 3px; display: flex; flex-wrap: wrap;">
        <span>
            <span data-tooltip={inEditMode ? "Finish editing first!" : null} data-inverted="">
                <button class="ui{inEditMode === true ? ' disabled' : ''} button" on:click|preventDefault={add}>Create session</button>
            </span>
            <span data-tooltip={inEditMode ? "Finish editing first!" : null} data-inverted="">
                <form class="ui form" style="display: inline;">
                    <label for="import-session-file" class="ui{inEditMode === true ? ' disabled' : ''} icon button">
                        <i class="download icon"></i>
                        Import session
                    </label>
                    <input type="file" id="import-session-file" class="ui file input"
                        accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed" on:change={importSession}>
                </form>
            </span>
        </span>
        {#if $pepperConnectionID !== null}
        <span>
            {#if $recording}
                {#if rec_paused}
                <button class="ui black button" on:click={resume_recording}>
                    <i class="ui play icon"></i>
                    Resume recording
                </button>
                {:else}
                <button class="ui disabled red button" on:click={pause_recording}>
                    <i class="ui pause icon"></i>
                    Pause recording
                </button>
                {/if}
                <button class="ui red button" on:click={stop_recording}>
                    <i class="ui stop icon"></i>
                    Stop recording
                </button>
            {:else}
                <button class="ui button" on:click={record_session}>
                    <i class="ui red circle icon"></i>
                    Record session
                </button>
            {/if}
        </span>
        {/if}
        <span>
            {#if !sessions && sessions.length === 0}
                <p><em>No sessions found.</em></p>
            {:else}
                {#if currentSession}
                    {#if inPresentationMode}
                        <button class="ui button mode-button" on:click|preventDefault={() => {inPresentationMode = !inPresentationMode}}>Detailed mode</button>
                    {:else}
                        {#if inEditMode}
                        <button class="ui button" on:click={save}>Save</button>
                        <button class="ui button" on:click={cancelEdit}>Cancel</button>
                        {:else}
                            <button class="ui button mode-button" on:click|preventDefault={() => {inPresentationMode = !inPresentationMode}}>Presentation mode</button>
                            <button class="ui button" on:click={edit}>Edit</button>
                        {/if}
                        <button class="ui button" on:click|preventDefault={remove} data-id="{currentSession.ID}" data-name="{currentSession.Name}">Remove</button>
                        {#if !inEditMode}
                            <span>
                                <button class="ui button" on:click|preventDefault={exportSession}>
                                    <i class="upload icon"></i>
                                    Export
                                </button>
                            </span>
                        {/if}
                    {/if}
                {/if}
            {/if}
        </span>
    </span>
    {#if inPresentationMode}
        <span style="margin-top: 3px; display: flex; flex-wrap: nowrap;">
            <button on:click|preventDefault={previousQuestion} class="ui icon button"><i class="arrow left icon"></i></button>
            <button on:click|preventDefault={nextQuestion} class="ui icon button"><i class="arrow right icon"></i></button>
        </span>
    {:else if inEditMode}
        <span>
            <span style="display: inline-flex;">
                <Select id="voice-select" containerStyles="font-size: 14px; width: 100px;" items={voices} showIndicator={true} bind:value={selectVoice}
                        on:select={handleVoiceChange} isClearable={false} listOffset={0} isSearchable={false}></Select>
            </span>
            <button class="ui button" style="display: inline;" on:click={confirmBatchSynthesis}>Save & Synthesize</button>
        </span>
    {/if}
</div>
