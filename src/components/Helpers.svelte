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

        // removing the notification after some time
        const timeoutID = window.setTimeout(() => {
            window.clearTimeout(timeoutID);
            notifications.removeChild(notification);
        }, 3000);
    }

    export function sendInstruction(id) {
        const payload = {
            "item_id": id
        }

        fetch("http://localhost:8080/pepper/send_command", {
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
</script>