var data = JSON.stringify({
  recipients: [
    {
      to: [
        {
          email: "gtxmaster2702@gmail.com",
          name: "Manan Rajpara",
        },
      ],
    },
  ],
  from: {
    email: "no-reply@{domain}",
  },
  domain: "{domain}",
  template_id: "YOUR_TEMPLATE_ID",
});

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function () {
  if (this.readyState === 4) {
    console.log(this.responseText);
  }
});

xhr.open("POST", "https://control.msg91.com/api/v5/email/send");
xhr.setRequestHeader("authkey", "YOUR_AUTHKEY");
xhr.setRequestHeader("Content-Type", "application/json");

xhr.send(data);
