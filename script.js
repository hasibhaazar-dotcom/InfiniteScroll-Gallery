const ACCESS_KEY = "mDkm8P7VO95RNa3u-PZv-YZ31O5_yj88efCwWBAOSsA";

const gallery = document.getElementById("gallery");
const loader = document.getElementById("loader");
const empty = document.getElementById("empty");
const errorBox = document.getElementById("error");
const searchInput = document.getElementById("searchInput");
const sentinel = document.getElementById("sentinel");
const retryBtn = document.getElementById("retryBtn");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const photoDetails = document.getElementById("photoDetails");
const closeBtn = document.getElementById("closeBtn");

let page = 1;
let currentQuery = "";
let isLoading = false;
let allPhotos = [];
let currentIndex = 0;

async function fetchPhotos(reset = false){
    if(isLoading) return;

    isLoading = true;
    loader.classList.remove("hidden");
    errorBox.classList.add("hidden");

    try{
        let url;

        if(currentQuery){
            url = `https://api.unsplash.com/search/photos?page=${page}&per_page=12&query=${currentQuery}&client_id=${ACCESS_KEY}`;
        }else{
            url = `https://api.unsplash.com/photos?page=${page}&per_page=12&client_id=${ACCESS_KEY}`;
        }

        const res = await fetch(url);

        if(!res.ok){
            throw new Error("API failed");
        }

        const data = await res.json();
        const photos = currentQuery ? data.results : data;

        if(reset){
            gallery.innerHTML = "";
            allPhotos = [];
            page = 1;
        }

        if(photos.length === 0){
            empty.classList.remove("hidden");
        }else{
            empty.classList.add("hidden");
            allPhotos.push(...photos);
            renderPhotos(photos);
            page++;
        }

    }catch(err){
        errorBox.classList.remove("hidden");
        console.error(err);
    }

    loader.classList.add("hidden");
    isLoading = false;
}

function renderPhotos(photos){
    photos.forEach(photo=>{
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img 
                src="${photo.urls.small}" 
                alt="${photo.alt_description || 'Photo'}"
                loading="lazy"
            />
        `;

        card.addEventListener("click", ()=>{
            currentIndex = allPhotos.indexOf(photo);
            openLightbox(currentIndex);
        });

        gallery.appendChild(card);
    });
}

function openLightbox(index){
    const photo = allPhotos[index];

    lightboxImg.src = photo.urls.regular;
    photoDetails.innerHTML = `
        <p>Photographer: ${photo.user.name}</p>
        <p>Likes: ${photo.likes}</p>
        <p>Resolution: ${photo.width} × ${photo.height}</p>
    `;

    lightbox.classList.remove("hidden");
}

function closeLightbox(){
    lightbox.classList.add("hidden");
}

closeBtn.addEventListener("click", closeLightbox);

document.addEventListener("keydown",(e)=>{
    if(lightbox.classList.contains("hidden")) return;

    if(e.key==="Escape") closeLightbox();

    if(e.key==="ArrowRight"){
        currentIndex = (currentIndex + 1) % allPhotos.length;
        openLightbox(currentIndex);
    }

    if(e.key==="ArrowLeft"){
        currentIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
        openLightbox(currentIndex);
    }
});

let debounceTimer;

searchInput.addEventListener("input",(e)=>{
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(()=>{
        currentQuery = e.target.value.trim();
        page = 1;
        fetchPhotos(true);
    },400);
});

document.querySelectorAll(".collection").forEach(btn=>{
    btn.addEventListener("click",()=>{
        currentQuery = btn.dataset.query;
        searchInput.value = currentQuery;
        page = 1;
        fetchPhotos(true);
    });
});

retryBtn.addEventListener("click",()=>fetchPhotos());

const observer = new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){
        fetchPhotos();
    }
});

observer.observe(sentinel);

fetchPhotos();
