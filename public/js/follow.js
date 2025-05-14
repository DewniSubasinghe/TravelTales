document.addEventListener('DOMContentLoaded', () => {
  // Follow buttons
  document.querySelectorAll('.follow-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const userId = e.target.dataset.user;
      try {
        const response = await fetch(`/users/${userId}/follow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'same-origin'
        });
       
        const result = await response.json();
        if (result.success) {
          if (result.followed) {
            e.target.textContent = 'Following';
            e.target.classList.add('btn-secondary');
            e.target.classList.remove('btn-primary');
          } else {
            e.target.textContent = 'Follow';
            e.target.classList.add('btn-primary');
            e.target.classList.remove('btn-secondary');
          }
          // Update follower count
          const followerCountElement = document.querySelector('.follow-stats .count:first-child');
          if (followerCountElement) {
            const currentCount = parseInt(followerCountElement.textContent);
            followerCountElement.textContent = result.followed ? currentCount + 1 : currentCount - 1;
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });

  // Unfollow buttons
  document.querySelectorAll('.unfollow-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const userId = e.target.dataset.user;
      try {
        const response = await fetch(`/users/${userId}/follow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'same-origin'
        });
       
        const result = await response.json();
        if (result.success && !result.followed) {
          e.target.closest('li').remove();
          // Update following count
          const followingCountElement = document.querySelector('.follow-stats .count:nth-child(2)');
          if (followingCountElement) {
            const currentCount = parseInt(followingCountElement.textContent);
            followingCountElement.textContent = currentCount - 1;
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });

  // Like buttons
  document.querySelectorAll('.like-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const postId = e.target.closest('.like-btn').dataset.post;
      try {
        const response = await fetch(`/blog/${postId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'same-origin'
        });
       
        const result = await response.json();
        if (result.success) {
          e.target.closest('.like-btn').classList.toggle('liked');
          const likeCountElement = e.target.closest('.like-btn').querySelector('.like-count');
          if (likeCountElement) {
            likeCountElement.textContent = result.likeCount;
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });
});