async function getData() {
  const url = "https://api.cafesansfil.ca/v1/cafes";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result = await response.json();
    console.log(result);
    
    result.items.forEach(item => {
        document.body.innerHTML += `
        <article>
           <h2>${item.name}</h2>
           <img height=60 src="${item.banner_url}">
           <p>${item.description}</p>
        </article>
        `
    });
  } catch (error) {
    console.error(error.message);
  }
}

getData();