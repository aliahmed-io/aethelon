async function run() {
    const res = await fetch("http://localhost:3000/api/search?q=comfortable%20reading%20chair&limit=5");
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}
run();
