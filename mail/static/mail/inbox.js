document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document
    .querySelector('#inbox')
    .addEventListener('click', () => load_mailbox('inbox'));
  document
    .querySelector('#sent')
    .addEventListener('click', () => load_mailbox('sent'));
  document
    .querySelector('#archived')
    .addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit form
  document
    .querySelector('#compose-form')
    .addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// Show email selected from mailbox
function show_email(id, original_mailbox) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  document.querySelector('#email-view').innerHTML = '';
  fetch(`emails/${id}`)
    .then((response) => response.json())
    .then((item) => {
      console.log(item);

      const email = document.createElement('div');
      document.querySelector('#email-view').append(email);

      const emailHeader = document.createElement('div');
      emailHeader.classList.add('email-header');
      emailHeader.innerHTML = `
      <p><strong>From: </strong>${item.sender}</p>
      <p><strong>To: </strong>${item.recipients}</p>
      <p><strong>Subject: </strong>${item.subject}</p>
      <p><strong>Timestamp: </strong>${item.timestamp}</p>
      
      `;
      email.append(emailHeader);

      // Reply button
      const replyBtn = document.createElement('button');
      replyBtn.classList.add(
        'btn',
        'btn-outline-primary',
        'btn-sm',
        'reply-btn'
      );
      replyBtn.type = 'submit';
      replyBtn.innerHTML = 'Reply';
      emailHeader.appendChild(replyBtn);

      // Reply email
      replyBtn.addEventListener('click', function () {
        compose_email();
        document.querySelector('#compose-recipients').value = item.sender;
        document.querySelector(
          '#compose-subject'
        ).value = `Re: ${item.subject}`;
        document.querySelector(
          '#compose-body'
        ).value = `\n On ${item.timestamp} ${item.sender} wrote: \n \n ${item.body} \n \n`;
      });

      // Archive and Unarchive button
      const archiveBtn = document.createElement('button');
      if (original_mailbox === 'sent') {
        archiveBtn.style.display = 'none';
      } else {
        console.log(original_mailbox);

        archiveBtn.classList.add(
          'btn',
          'btn-outline-danger',
          'btn-sm',
          'archive-btn'
        );
        archiveBtn.innerHTML = item.archived ? 'Unarchive' : 'Archive';
      }

      // Archive email
      archiveBtn.addEventListener('click', function () {
        fetch(`/emails/${item.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: !item.archived,
          }),
        }).then(() => {
          load_mailbox('archive');
        });
        console.log('archived email');
        console.log(item.archived);
      });
      emailHeader.appendChild(archiveBtn);

      // Email body
      const line = document.createElement('hr');
      emailHeader.appendChild(line);

      const emailBody = document.createElement('div');
      emailBody.innerHTML = item.body;
      email.append(emailBody);

      // Change email to read

      fetch(`/emails/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true,
        }),
      }).then();
    });
}

function load_mailbox(mailbox) {
  console.log(mailbox);
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  // Show emails in mailbox
  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      console.log(emails);
      emails.forEach((item) => {
        // Create div for each email in mailbox
        const emailContainer = document.createElement('div');
        emailContainer.className = 'email-container';

        document.querySelector('#emails-view').append(emailContainer);

        const emailContent = document.createElement('div');
        emailContent.classList.add('email-content');
        emailContainer.append(emailContent);

        const sender = document.createElement('h6');
        sender.classList.add('email-sender');
        sender.innerHTML = item.sender;
        emailContent.append(sender);

        const subject = document.createElement('p');
        subject.classList.add('email-subject');
        subject.innerHTML = item.subject;
        emailContent.append(subject);

        const timestamp = document.createElement('p');
        timestamp.classList.add('email-timestamp');
        timestamp.innerHTML = item.timestamp;
        emailContainer.append(timestamp);

        // Update background-color when read
        emailContainer.classList.add(item.read ? 'read' : 'unread');

        // Open email selected
        emailContainer.addEventListener('click', () => {
          show_email(item.id, mailbox);
        });
      });
    });
}

function send_email(event) {
  // To avoid reloading the page
  event.preventDefault();

  // Get email fields
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Send data
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
      // read: false,
    }),
  })
    // Parse data in JSON format
    .then((response) => response.json())
    .then((result) => {
      load_mailbox('sent');
    });
}
