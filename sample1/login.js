document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const { data, error } = await db
        .from('USER')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

    if (error || !data) {
        alert('Invalid email or password!');
    } else {
        alert('Welcome back, ' + data.full_name + '!');
        localStorage.setItem('loggedInUser', JSON.stringify(data));
        window.location.href = '../sample2/sample2.html';
    }
});
