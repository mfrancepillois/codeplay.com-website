let timer = null;
function debounce(func) {
   clearTimeout(timer);
   timer = setTimeout(func, 500);
}


$(document).ready(function () {
   let originalPosts = $('#news-list').contents();

   let searchIndex = [];
   $.getJSON('/portal.json', function( data ) {
      searchIndex = data['items'];
   });

   $('input').on('input', function() {
      const iThis = $(this);
      debounce(function() {
         let searchValue = iThis.val().toLowerCase();

         $('#news-list').empty();
         $('#no-results').remove();

         if(searchValue === '') {
            $('#news-list').append(originalPosts);
            $('.paginator').show();
         } else {
            $('.paginator').hide();

            let found = [];
            for(let item of searchIndex) {
               const lowerCaseTitle = item['title'].toLowerCase();
               const lowerCaseAuthor = item['authors'][0]['name'].toLowerCase();
               const splitSearchValues = searchValue.toLowerCase().split(' ');

               if(splitSearchValues.every(item => lowerCaseTitle.includes(item))) {
                  if(!found.includes(item)) {
                     found.push(item);
                  }
               }

               if(splitSearchValues.every(item => lowerCaseAuthor.includes(item))) {
                  if(!found.includes(item)) {
                     found.push(item);
                  }
               }
            }

            found.sort(function(a, b) {
               let c = new Date(a['date']);
               let d = new Date(b['date']);
               return d-c;
            });

            if (found.length === 0) {
               $('#news-list').parent().append('<div id="no-results"><h1>No Results Found!</h1></div>');
               return;
            }

            let count = 0;
            for(let item of found) {
               $('#news-list').append(
                   createNewsPanel(
                       item['id'],
                       item['url'],
                       item['thumbnail'],
                       item['authors'][0]['avatar'],
                       item['authors'][0]['name'],
                       item['category'],
                       item['title'],
                       item['description'],
                       item['date_published'])
               );

               if(count > 20)
                  break;

               count = count + 1;
            }
         }
      });
   });
});

function decodeEntities(encodedString) {
   let textArea = document.createElement('textarea');
   textArea.innerHTML = encodedString;
   return textArea.value;
}

function createNewsPanel(id, url, thumbnailUrl, authorAvatarUrl, authorTitle, category, title, description, date) {
   return $('<div class="news-panel">' +
'                        <a href="' + url + '">' +
'                            <div>' +
'                                <img src="' + thumbnailUrl + '" alt="' + title + ' Image" />' +
'                            </div>' +
'                            <div>' +
'                                <div class="avatar">' +
'                                    <img src="' + authorAvatarUrl + '" alt="' + authorTitle + '\'s Avatar" />' +
'                                </div>' +
'                                <small>' + category + '</small>' +
'                                <h2>' + decodeEntities(title) + '</h2>' +
'                                <p>' + decodeEntities(description) + '</p>' +
'                                <h4>' + date + '</h4>' +
'                            </div>' +
'                        </a>' +
'                    </div>');
}
