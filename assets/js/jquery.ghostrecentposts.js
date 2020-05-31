/*!
 * @package jquery.ghostrecentposts
 * @version 1.0.0
 * @Copyright (C) 2015 Katie Bolt
 * @License MIT
 */
;(function($) {

    defaults = {
        feed: '/rss',
        titleClass: '.post-title',
        tagsClass: '.post-meta',
        limit: 5,
		dateFormat: 'DD MMMM YYYY',
        debug: false
    }


    function RecentPosts(element, options) {

        this.element = element;
        this.options = $.extend({}, defaults, options);

        this.parseRss();
    };

    RecentPosts.prototype.displayRecent = function(posts) {

        var self = this,
            count = 0;

        posts.forEach(function(post) {
            if (count < self.options.limit) {
                $(self.element).append($('<li><div class="date"><time datetime="' + moment(post.date).format('YYYY-MM-DD') + '">' + moment(post.date).format(self.options.dateFormat) + '</time></div><div class="recent-post-name"><a href="' + post.url + '">' + post.title + '</a></div></li>'));
            }
            count++;
        });

        if (count == 0) {
            $(this.element).append($('<p>No recent posts were found. ' +
                'Check the <a href="/">index</a>.</p>'));
        }
    
    };

    RecentPosts.prototype.parseRss = function(pageNum, prevId, posts) {

        var page = pageNum || 1,
            prevId = prevId || '',
            posts = posts || [],
            self = this,
			url = this.options.feed;
		if (page > 1){
			url += '/' + page;
		}

        $.ajax({
            url: url,
            type: 'GET'
        })
        .done(function(data, textStatus, xhr) {

            var curId = $(data).find('item > guid').text();
			posts = $.merge(posts, self.getPosts(data));
			if(curId === prevId || posts.length >= self.options.limit) {
			    if (posts.length < 1){
					this.reportError("Couldn't find any posts in feed: " + feed);
				} else {
					self.displayRecent(posts);			
				}
			} else {
                self.parseRss(page+1, curId, posts);			
			}
        })
        .fail(function(e) {
            self.reportError(e);
        });

    };


    RecentPosts.prototype.getPosts = function(data) {

        var posts = [], 
			items = $(data).find('item');

        for (var i = 0; i < items.length; i++) {

            var item = $(items[i]);
            posts.push({
                title: item.find('title').text(),
                date: new Date(item.find('pubDate').text()),
                url: item.find('link').text(),
                content: item.find('description').text(),
                tags: $.map(item.find('category'), function(elem) {
                    return $(elem).text();
                })
            });
        }

        return posts;
    };


    RecentPosts.prototype.reportError = function(error) {
        if (this.options.debug) {
            $(this.element).append($('<li>' + error + '</li>'));
        }
    };


    $.fn.ghostRecent = function(options) {

        return this.each(function() {
            new RecentPosts(this, options);
        });
    };


})(jQuery);
