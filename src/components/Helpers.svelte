<script context="module">
    export function notify(label, message) {
        // adding a notification item
        const notification = document.createElement("div");
        notification.classList.add("notification-item");
        notification.classList.add(label);
        notification.innerText = message;

        // global notifications container on each page
        const notifications = document.getElementById("notifications");
        notifications.appendChild(notification);

        // conditional timeout
        let timeout = 3000;
        if (label === "negative") {
            timeout = 5000;
        }

        // removing the notification after some time
        const timeoutID = window.setTimeout(() => {
            window.clearTimeout(timeoutID);
            notifications.removeChild(notification);
        }, timeout);
    }

    export function sendInstruction(id, serverIP) {
        const payload = {
            "item_id": id
        }
        console.log("sending instruction", payload)
        fetch(`http://${serverIP}:8080/api/pepper/send_command`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then((response) => {
                if (response["error"] && response["error"].length > 0) {
                    notify("negative", response["error"]);
                } else if (response["message"]) {
                    notify("positive", response["message"]);
                }
            })
            .catch((err) => {
                console.error(err);
                notify("negative", err);
            })
    }

    export function filterByGroup(items) {
        let groups = new Set();
        for (const item of items) {
            groups.add(item.Group);
        }
        let byGroups = {};
        for (const group of groups) {
            byGroups[group] = items.filter(item => item.Group === group);
        }
        return byGroups;
    }

    export function fetchWith(dataHolder) {
        console.log("fetching", `http://${dataHolder.host}:8080/api/${dataHolder.kind}/`);
        fetch(`http://${dataHolder.host}:8080/api/${dataHolder.kind}/`)
            .then(r => r.json())
            .then(d => {
                dataHolder.items = d.data;
                dataHolder.itemsByGroup = filterByGroup(d.data);
                dataHolder.isFetchNeeded = false;
            })
            .catch(err => {
                console.error("error:", err);
                dataHolder.isFetchNeeded = false;
            });
    }

    function makeID(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
</script>
