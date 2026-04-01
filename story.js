document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const currentStory = window.CURRENT_STORY_ID;
    const ownerAccounts = window.OWNER_ACCOUNTS;

    const storyContainer = document.getElementById('story-container');
    const igFullname = document.getElementById('ig-fullname');
    const bioText = document.getElementById('bio-text');
    const editBioBtn = document.getElementById('edit-bio-btn');
    const shareProfileBtn = document.getElementById('share-profile-btn');
    const backToChoicesBtn = document.getElementById('back-to-choices-btn');

    const editModal = document.getElementById('edit-modal');
    const bioEditor = document.getElementById('bio-editor');
    const editName = document.getElementById('edit-name');
    const editWallpaperFile = document.getElementById('edit-wallpaper-file');
    const fileNameDisplay = document.getElementById('file-name-display');
    const clearWallpaperBtn = document.getElementById('clear-wallpaper-btn');
    const wallpaperPreviewContainer = document.getElementById('wallpaper-preview-container');
    const wallpaperPreviewImg = document.getElementById('wallpaper-preview-img');
    const saveBioBtn = document.getElementById('save-bio-btn');
    const cancelBioBtn = document.getElementById('cancel-bio-btn');

    const addStoryModal = document.getElementById('add-story-modal');
    const addPostBtn = document.getElementById('add-post-btn');
    const storyTitleInput = document.getElementById('story-title-input');
    const storyContentInput = document.getElementById('story-content-input');
    const saveStoryBtn = document.getElementById('save-story-btn');
    const cancelStoryBtn = document.getElementById('cancel-story-btn');
    const gridContainer = document.getElementById('ig-grid-container');

    const storyReaderModal = document.getElementById('story-reader-modal');
    const readerTitle = document.getElementById('reader-title');
    const readerContent = document.getElementById('reader-content');
    const closeReaderBtn = document.getElementById('close-reader-btn');
    const playerVideo = document.getElementById('player-video');
    const videoContainer = document.getElementById('video-container');

    const videoUploadSection = document.getElementById('video-upload-section');
    const storyVideoFile = document.getElementById('story-video-file');
    const videoNameDisplay = document.getElementById('video-name-display');

    const commentInput = document.getElementById('comment-input');
    const postCommentBtn = document.getElementById('post-comment-btn');
    const commentsList = document.getElementById('comments-list');
    const readerAvatar = document.getElementById('reader-avatar');
    const readerAuthorName = document.getElementById('reader-author-name');
    const readerPostDate = document.getElementById('reader-post-date');
    const actualComments = document.getElementById('actual-comments');
    const captionAuthorName = document.querySelector('.caption-author-name');
    const captionAvatar = document.querySelector('.caption-avatar');

    let uploadedWallpaper = null;
    let selectedVideoBlob = null;
    let currentOpenPost = null;

    // --- Build Story View UI Elements ---
    const readerMediaCol = document.querySelector('.reader-media-col');
    const readerInfoCol = document.querySelector('.reader-info-col');
    const readerPanel = document.querySelector('.reader-panel');

    // 1. Story Header (title + close button at top of story view)
    const storyHeader = document.createElement('div');
    storyHeader.className = 'story-view-header';
    storyHeader.innerHTML = `
        <h2 id="story-view-title" class="story-view-title">Title</h2>
        <button class="story-close-btn" id="story-close-x">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    `;
    if (readerMediaCol) readerMediaCol.insertBefore(storyHeader, readerMediaCol.firstChild);

    // 2. Story Footer - Large ROUNDED Add Comment Button (Mockup style)
    const storyFooter = document.createElement('div');
    storyFooter.className = 'story-view-footer';
    storyFooter.innerHTML = `
        <button id="story-footer-comment-btn" class="story-footer-btn">
            Add Comment
        </button>
    `;
    if (readerMediaCol) readerMediaCol.appendChild(storyFooter);

    // 3. Back-to-story button in comments header
    const backToStoryBtn = document.createElement('button');
    backToStoryBtn.id = 'back-to-story-btn';
    backToStoryBtn.className = 'back-to-story-btn';
    backToStoryBtn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`;
    const readerHeader = document.querySelector('.reader-header');
    if (readerHeader) readerHeader.insertBefore(backToStoryBtn, readerHeader.firstChild);

    // --- Mode Toggle Functions ---
    function setStoryMode() {
        if (readerPanel) {
            readerPanel.classList.add('story-mode');
            readerPanel.classList.remove('comments-mode');
        }
    }

    function setCommentsMode() {
        if (readerPanel) {
            readerPanel.classList.remove('story-mode');
            readerPanel.classList.add('comments-mode');
        }
    }

    function closeReaderModal() {
        playerVideo.pause();
        playerVideo.src = '';
        currentOpenPost = null;
        storyReaderModal.classList.remove('active');
        if (readerPanel) {
            readerPanel.classList.remove('story-mode');
            readerPanel.classList.remove('comments-mode');
        }
        setTimeout(() => storyReaderModal.classList.add('hidden'), 300);
    }

    // Story Footer button → switch to comments
    const footerCommentBtn = document.getElementById('story-footer-comment-btn');
    if (footerCommentBtn) {
        footerCommentBtn.addEventListener('click', () => {
            setCommentsMode();
        });
    }

    // Story close button → close modal
    const storyCloseX = document.getElementById('story-close-x');
    if (storyCloseX) {
        storyCloseX.addEventListener('click', closeReaderModal);
    }

    // Back to story button → switch to story
    backToStoryBtn.addEventListener('click', () => {
        setStoryMode();
    });

    // Removed old story view comment post handler since it's replaced by the "Add Comment" button that switches view

    // --- Supabase Cloud Database ---
    const SUPABASE_URL = 'https://lezmniypicjcbyetucvz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlem1uaXlwaWNqY2J5ZXR1Y3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTg4MDgsImV4cCI6MjA5MDI5NDgwOH0.Q5UHhIr_wd2XqNFQJKu2F2hfAjsrm-RhjbU8PNRhfo8';
    const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const initDB = async () => {
        console.log("☁️ Cloud Database (Supabase) connected.");
        return true;
    };

    // Save a post (story/video/question) to the cloud
    const saveToDB = async (storeName, data) => {
        console.log(`☁️ Cloud Save to ${storeName}:`, data);

        if (storeName === 'comments') {
            const { error: commentError } = await _supabase
                .from('comments')
                .insert([{
                    store_name: data.storeName,
                    post_id: data.postId,
                    author: data.author,
                    text: data.text,
                    date: data.date
                }]);
            if (commentError) throw commentError;
            return;
        }

        const { error } = await _supabase
            .from('posts')
            .insert([{
                store_name: storeName,
                title: data.title || '',
                content: data.content || '',
                video_url: data.video_url || '',
                date: data.date
            }]);

        if (error) throw error;
    };

    // Load posts from the cloud
    const loadFromDB = async (storeName) => {
        const { data, error } = await _supabase
            .from('posts')
            .select('*')
            .eq('store_name', storeName)
            .order('id', { ascending: false });

        if (error) {
            console.error('Error loading stories:', error);
            return [];
        }
        return data;
    };

    // Load comments for a specific post from the cloud
    const loadCommentsForPost = async (storeName, postId) => {
        const { data, error } = await _supabase
            .from('comments')
            .select('*')
            .eq('store_name', storeName)
            .eq('post_id', postId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error loading comments:', error);
            return [];
        }
        return data;
    };

    function timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        if (seconds < 10) return "just now";
        return Math.floor(seconds) + " seconds ago";
    }

    const defaultData = {
        '3MKFXG': {
            name: "System Override",
            bio: "Welcome to the matrix...\n\nSYSTEM OVERRIDE DETECTED.\n\n[ADD YOUR BIO INFO HERE]",
            wallpaper: null
        },
        'DALAL': {
            name: "Dalal 🌸",
            bio: "Hii! 🌸 Welcome to my story! 💕\n\nEnjoy the cuteness, put your bio here!",
            wallpaper: null
        }
    };

    // Load profile data from the CLOUD DATABASE
    async function loadProfileData() {
        let savedBio, savedName, savedWallpaper;

        try {
            const { data, error } = await _supabase
                .from('profiles')
                .select('*')
                .eq('username', currentStory)
                .single();

            if (data && !error) {
                savedBio = data.bio || defaultData[currentStory].bio;
                savedName = data.full_name || defaultData[currentStory].name;
                savedWallpaper = data.wallpaper || null;
                console.log("☁️ Profile loaded from cloud:", data);
            } else {
                savedBio = defaultData[currentStory].bio;
                savedName = defaultData[currentStory].name;
                savedWallpaper = null;
            }
        } catch (e) {
            console.error("Cloud load error, using defaults:", e);
            savedBio = defaultData[currentStory].bio;
            savedName = defaultData[currentStory].name;
            savedWallpaper = null;
        }

        bioText.textContent = savedBio;
        if (igFullname) igFullname.textContent = savedName;

        if (savedWallpaper) {
            storyContainer.style.backgroundImage = `url(${savedWallpaper})`;
            storyContainer.style.backgroundSize = 'cover';
            storyContainer.style.backgroundPosition = 'center';
            storyContainer.style.backgroundBlendMode = 'overlay';
            storyContainer.classList.add('has-wallpaper');

            document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${savedWallpaper})`;
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'center';
            document.body.style.backgroundAttachment = 'fixed';
        } else {
            storyContainer.style.backgroundImage = 'none';
            storyContainer.classList.remove('has-wallpaper');
            document.body.style.backgroundImage = '';
        }

        // Show/Hide buttons based on ownership
        const isOwner = ownerAccounts.some(acc =>
            String(acc).toUpperCase() === String(currentUser).toUpperCase()
        );

        if (isOwner) {
            if (editBioBtn) { editBioBtn.classList.remove('hidden'); editBioBtn.style.display = 'flex'; }
            if (shareProfileBtn) { shareProfileBtn.classList.remove('hidden'); shareProfileBtn.style.display = 'flex'; }
        } else {
            console.log("Not recognized as owner. Logged in as:", currentUser, "Allowed:", ownerAccounts);
            if (editBioBtn) { editBioBtn.classList.add('hidden'); editBioBtn.style.display = 'none'; }
            if (shareProfileBtn) { shareProfileBtn.classList.add('hidden'); shareProfileBtn.style.display = 'none'; }
        }

        // Show container smoothly
        storyContainer.classList.remove('hidden');
        storyContainer.classList.add('active');
        storyContainer.style.display = 'block';

        const category = window.CURRENT_CATEGORY || 'story';

        // Update tab active state based on CURRENT_CATEGORY
        document.querySelectorAll('.ig-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.getElementById('tab-' + category + 's');
        if (activeTab) activeTab.classList.add('active');

        loadGridContent(category);
    }

    function getCategoryFromTab(tabId) {
        if (tabId === 'tab-stories' || tabId === 'link-stories') return 'story';
        if (tabId === 'tab-videos' || tabId === 'link-videos') return 'video';
        if (tabId === 'tab-questions' || tabId === 'link-questions') return 'question';
        return 'story';
    }

    async function loadGridContent(category) {
        const storeName = `user_${category}s_${currentStory}`;
        let items = [];

        try {
            items = await loadFromDB(storeName);
        } catch (e) {
            console.error(e);
        }

        const addBtn = document.getElementById('add-post-btn');
        const isOwner = ownerAccounts.some(acc => String(acc).toUpperCase() === String(currentUser).toUpperCase());

        gridContainer.innerHTML = '';
        if (addBtn && isOwner) {
            addBtn.classList.remove('hidden');
            const addLabel = addBtn.querySelector('span');
            if (addLabel) addLabel.textContent = 'Add ' + category.charAt(0).toUpperCase() + category.slice(1);
            gridContainer.appendChild(addBtn);
        } else if (addBtn) {
            addBtn.classList.add('hidden');
        }

        items.forEach((data, index) => {
            const item = document.createElement('div');
            item.className = 'ig-grid-item';
            item.style.display = 'flex';
            item.style.flexDirection = 'column';
            item.style.justifyContent = 'center';
            item.style.alignItems = 'center';
            item.style.padding = '0.5rem';
            item.style.fontSize = '0.8rem';
            item.style.textAlign = 'center';
            item.style.cursor = 'pointer';

            let icon = '📖';
            if (category === 'video' || data.video_url) icon = '🎬';
            if (category === 'question') icon = '❓';

            item.innerHTML = `<span style="font-size:1.5rem;margin-bottom:5px;">${icon}</span><strong style="display:block;margin-bottom:2px;">${data.title}</strong><span style="opacity:0.7;font-size:0.7rem;">Click to view</span>`;

            item.onclick = async () => {
                currentOpenPost = { category, id: data.id, storeName };
                readerTitle.textContent = data.title;
                readerContent.textContent = data.content;

                // Update Sidebar Info from cloud
                let profileName = defaultData[currentStory] ? defaultData[currentStory].name : currentStory;
                try {
                    const { data: profileData } = await _supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('username', currentStory)
                        .single();
                    if (profileData) profileName = profileData.full_name || profileName;
                } catch (e) { }

                if (readerAuthorName) readerAuthorName.textContent = profileName;
                if (readerAvatar) readerAvatar.textContent = profileName.charAt(0).toUpperCase();
                if (readerPostDate) readerPostDate.textContent = timeAgo(data.date);
                if (captionAuthorName) captionAuthorName.textContent = profileName;
                if (captionAvatar) captionAvatar.textContent = profileName.charAt(0).toUpperCase();

                // Get text display elements
                const textDisplay = document.getElementById('text-display');
                const tdTitle = document.getElementById('td-title');
                const tdContent = document.getElementById('td-content');
                const tdAvatar = document.getElementById('td-avatar');
                const tdName = document.getElementById('td-name');
                const tdDate = document.getElementById('td-date');
                const captionBox = document.getElementById('reader-caption-box');
                const currentCategory = window.CURRENT_CATEGORY || 'story';

                // Unified Two-View Toggle (Primary vs Comments)
                if (currentCategory === 'video') {
                    // Start in Primary Mode (Show Video)
                    if (data.video_url) {
                        playerVideo.src = data.video_url;
                        videoContainer.classList.remove('hidden');
                        playerVideo.load();
                    } else {
                        playerVideo.src = '';
                        videoContainer.classList.add('hidden');
                    }
                    if (textDisplay) textDisplay.classList.remove('active');
                    if (captionBox) captionBox.style.display = 'none';

                    // Update the HEADER TITLE for video
                    const storyTitle = document.getElementById('story-view-title');
                    if (storyTitle) storyTitle.textContent = data.title;

                    // Ensure we are in primary 'story-mode' view (shows video + header/footer)
                    setStoryMode();
                } else {
                    // Primary Mode (Show Text)
                    playerVideo.src = '';
                    videoContainer.classList.add('hidden');

                    if (textDisplay) {
                        tdTitle.textContent = data.title;
                        tdContent.textContent = data.content;
                        tdAvatar.textContent = profileName.charAt(0).toUpperCase();
                        tdName.textContent = profileName;
                        tdDate.textContent = timeAgo(data.date);
                        textDisplay.classList.add('active');

                        // Update the HEADER TITLE for text
                        const storyTitle = document.getElementById('story-view-title');
                        if (storyTitle) storyTitle.textContent = data.title;
                    }

                    // Hide the caption from the right side (avoid duplicate)
                    if (captionBox) captionBox.style.display = 'none';

                    // Start in primary 'story-mode' (Shows content + new header/footer)
                    setStoryMode();
                }

                // Load Comments
                renderComments();

                storyReaderModal.classList.remove('hidden');
                setTimeout(() => storyReaderModal.classList.add('active'), 10);
            };

            gridContainer.appendChild(item);
        });

        const totalItems = items.length + (isOwner ? 1 : 0);
        if (totalItems < 6) {
            for (let i = 0; i < (6 - totalItems); i++) {
                const placeholder = document.createElement('div');
                placeholder.className = 'ig-grid-item';
                gridContainer.appendChild(placeholder);
            }
        }
    }

    // Initialize Page
    initDB().then(() => {
        loadProfileData();
    });

    // Nav Interactions
    if (backToChoicesBtn) {
        backToChoicesBtn.addEventListener('click', () => {
            window.location.href = 'choices.html';
        });
    }

    // Edit Modal Interactions
    if (editWallpaperFile) {
        editWallpaperFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 4 * 1024 * 1024) {
                    alert("This image is too large! Please choose a photo smaller than 4MB.");
                    editWallpaperFile.value = '';
                    return;
                }

                fileNameDisplay.textContent = file.name;
                const reader = new FileReader();
                reader.onload = function (event) {
                    uploadedWallpaper = event.target.result;
                    if (wallpaperPreviewImg) {
                        wallpaperPreviewImg.src = uploadedWallpaper;
                        wallpaperPreviewContainer.classList.remove('hidden');
                    }
                };
                reader.readAsDataURL(file);
            } else {
                fileNameDisplay.textContent = 'No file chosen';
            }
        });
    }

    if (clearWallpaperBtn) {
        clearWallpaperBtn.addEventListener('click', () => {
            uploadedWallpaper = null;
            editWallpaperFile.value = '';
            fileNameDisplay.textContent = 'No file chosen';
            if (wallpaperPreviewContainer) {
                wallpaperPreviewContainer.classList.add('hidden');
                wallpaperPreviewImg.src = '';
            }
        });
    }

    if (editBioBtn) {
        editBioBtn.addEventListener('click', async () => {
            // Load current profile data from the cloud
            let savedName = defaultData[currentStory].name;
            let savedBio = defaultData[currentStory].bio;
            let savedWallpaper = null;

            try {
                const { data } = await _supabase
                    .from('profiles')
                    .select('*')
                    .eq('username', currentStory)
                    .single();
                if (data) {
                    savedName = data.full_name || savedName;
                    savedBio = data.bio || savedBio;
                    savedWallpaper = data.wallpaper || null;
                }
            } catch (e) { }

            editName.value = savedName;
            bioEditor.value = savedBio;

            editWallpaperFile.value = '';
            fileNameDisplay.textContent = 'No file chosen';
            uploadedWallpaper = savedWallpaper;

            if (uploadedWallpaper && wallpaperPreviewContainer) {
                wallpaperPreviewImg.src = uploadedWallpaper;
                wallpaperPreviewContainer.classList.remove('hidden');
            } else if (wallpaperPreviewContainer) {
                wallpaperPreviewContainer.classList.add('hidden');
            }

            editModal.classList.remove('hidden');
            setTimeout(() => {
                editModal.classList.add('active');
            }, 10);
        });
    }

    if (cancelBioBtn) {
        cancelBioBtn.addEventListener('click', () => {
            editModal.classList.remove('active');
            setTimeout(() => {
                editModal.classList.add('hidden');
            }, 300);
        });
    }

    if (saveBioBtn) {
        saveBioBtn.addEventListener('click', async () => {
            const newBio = bioEditor.value.trim();
            const newName = editName.value.trim();

            try {
                // Save profile to CLOUD DATABASE
                const { error } = await _supabase
                    .from('profiles')
                    .update({
                        bio: newBio,
                        full_name: newName,
                        wallpaper: uploadedWallpaper || ''
                    })
                    .eq('username', currentStory);

                if (error) throw error;
                console.log("☁️ Profile saved to cloud!");
            } catch (e) {
                console.error("Save error:", e);
                alert("Failed to save profile. Please try again.");
            }

            await loadProfileData();

            editModal.classList.remove('active');
            setTimeout(() => {
                editModal.classList.add('hidden');
            }, 300);
        });
    }

    if (addPostBtn) {
        addPostBtn.addEventListener('click', () => {
            const isOwner = ownerAccounts.some(acc => String(acc).toUpperCase() === String(currentUser).toUpperCase());
            if (isOwner) {
                storyTitleInput.value = '';
                storyContentInput.value = '';
                storyVideoFile.value = '';
                videoNameDisplay.textContent = 'No video chosen';
                selectedVideoBlob = null;

                const category = window.CURRENT_CATEGORY || 'story';

                if (category === 'video') {
                    videoUploadSection.classList.remove('hidden');
                } else {
                    videoUploadSection.classList.add('hidden');
                }

                addStoryModal.classList.remove('hidden');
                setTimeout(() => addStoryModal.classList.add('active'), 10);
            } else {
                alert("Only the profile owner can post content!");
            }
        });
    }

    if (storyVideoFile) {
        storyVideoFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                videoNameDisplay.textContent = file.name;
                selectedVideoBlob = file;
            }
        });
    }

    if (cancelStoryBtn) {
        cancelStoryBtn.addEventListener('click', () => {
            addStoryModal.classList.remove('active');
            setTimeout(() => addStoryModal.classList.add('hidden'), 300);
        });
    }

    if (saveStoryBtn) {
        saveStoryBtn.addEventListener('click', async () => {
            const title = storyTitleInput.value.trim();
            const content = storyContentInput.value.trim();
            const category = window.CURRENT_CATEGORY || 'story';

            if (!title || (category !== 'video' && !content)) {
                alert("Please fill in the title and description!");
                return;
            }

            console.log("Posting content for category:", category, "Title:", title);

            const storeName = `user_${category}s_${currentStory}`;
            const data = {
                title,
                content,
                date: new Date().toISOString(),
                video_url: ''
            };

            // For videos, upload to Supabase Storage if possible
            if (category === 'video' && selectedVideoBlob) {
                try {
                    const fileName = `${Date.now()}_${selectedVideoBlob.name}`;
                    const { data: uploadData, error: uploadError } = await _supabase
                        .storage
                        .from('videos')
                        .upload(fileName, selectedVideoBlob);

                    if (!uploadError && uploadData) {
                        const { data: urlData } = _supabase
                            .storage
                            .from('videos')
                            .getPublicUrl(fileName);
                        data.video_url = urlData.publicUrl;
                    }
                } catch (e) {
                    console.warn("Video upload failed, saving without video:", e);
                }
            }

            await saveToDB(storeName, data);

            alert(`${category.charAt(0).toUpperCase() + category.slice(1)} posted successfully!`);

            storyTitleInput.value = '';
            storyContentInput.value = '';
            if (storyVideoFile) storyVideoFile.value = '';
            selectedVideoBlob = null;

            await loadGridContent(category);

            addStoryModal.classList.remove('active');
            setTimeout(() => addStoryModal.classList.add('hidden'), 300);
        });
    }

    if (closeReaderBtn) {
        closeReaderBtn.addEventListener('click', () => {
            playerVideo.pause();
            playerVideo.src = '';
            currentOpenPost = null;
            storyReaderModal.classList.remove('active');
            if (readerPanel) {
                readerPanel.classList.remove('story-mode');
                readerPanel.classList.remove('comments-mode');
            }
            setTimeout(() => storyReaderModal.classList.add('hidden'), 300);
        });
    }

    if (postCommentBtn) {
        postCommentBtn.addEventListener('click', async () => {
            const input = document.getElementById('comment-input');
            const text = input ? input.value.trim() : "";

            console.log("Post Comment Clicked. Content:", text, "PostID:", currentOpenPost ? currentOpenPost.id : 'NONE');

            if (!text) {
                alert("Please type a comment first!");
                return;
            }

            if (!currentOpenPost) {
                alert("Post error: Could not identify the reel.");
                return;
            }

            const commentData = {
                storeName: currentOpenPost.storeName,
                postId: currentOpenPost.id,
                author: currentUser || "Guest",
                text: text,
                date: new Date().toISOString()
            };

            try {
                await saveToDB('comments', commentData);
                input.value = '';
                await renderComments();
                console.log("☁️ Comment saved to cloud and rendered.");
            } catch (e) {
                console.error("Save error:", e);
                alert("Failed to save comment. Please try again.");
            }
        });
    }

    async function renderComments() {
        if (!currentOpenPost) return;

        const comments = await loadCommentsForPost(currentOpenPost.storeName, currentOpenPost.id);
        actualComments.innerHTML = '';

        if (comments.length === 0) {
            actualComments.innerHTML = '<p style="opacity:0.5; font-size:0.8rem;">No comments yet. Be the first!</p>';
            return;
        }

        comments.forEach(c => {
            const div = document.createElement('div');
            div.style.marginBottom = '1.2rem';
            div.style.background = 'rgba(255,255,255,0.08)';
            div.style.padding = '1rem';
            div.style.borderRadius = '12px';
            div.style.border = '1px solid rgba(255,255,255,0.1)';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="display:flex; align-items:center; gap: 0.5rem;">
                        <div style="width:24px; height:24px; border-radius:50%; background:var(--accent-1); display:flex; align-items:center; justify-content:center; font-size:0.6rem; font-weight:800; color:white;">
                            ${String(c.author).charAt(0).toUpperCase()}
                        </div>
                        <strong style="font-size:0.9rem; color: #fff;">${c.author}</strong>
                    </div>
                    <span style="font-size:0.75rem; opacity:0.6; font-weight: 500;">${timeAgo(c.date)}</span>
                </div>
                <p style="font-size:0.95rem; line-height:1.5; color: rgba(255,255,255,0.9);">${c.text}</p>
            `;
            actualComments.appendChild(div);
        });
    }

    // Tab Switching Logic (Now navigation)
    const tabs = document.querySelectorAll('.ig-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = getCategoryFromTab(tab.id);
            const userPrefix = currentStory.toLowerCase();
            let targetFile = userPrefix + '.html';

            if (category === 'video') targetFile = userPrefix + '_vids.html';
            if (category === 'question') targetFile = userPrefix + '_ask.html';

            window.location.href = targetFile;
        });
    });
});
