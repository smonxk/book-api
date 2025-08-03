
$(function() {

    const $items = $(
        "#search-result .book-item, #simona-books .book-item, #user-section .book-item"
    ).add($("#latest-section .book-item").last()); //exception with latest-section as only the most recently added book animates itself

    $items.css({
        opacity: 0, position: "relative", top: "20px"
    });
    $("#socials").css({ opacity: 0, top: "-30px" });

    
    $(".reveal").on("click", function(){
        const $form = $(this).closest("form");
        const $status = $form.find(".status-wrapper");
        
        
        $status.removeClass("hidden") .animate({
            opacity: 1, height: "7em" 
        }, 400);

        const $item = $(this).closest(".book-item");
        $item.find(".book-text").animate({ bottom: "20px" }, 600);
        $item.find("img, .no-image").animate({ bottom: "20px" }, 600);

        $(this).addClass("hidden");
    });

    $(".collide").on("click", function(e){
        e.preventDefault();

        const $form = $(this).closest("form");
        const $status = $form.find(".status-wrapper");

        $status.animate({
            opacity: 0, height: "0" 
        }, 400, function(){
            $status.addClass("hidden");
        });
        
        const $item = $(this).closest(".book-item");
        $item.find(".book-text").animate({ bottom: "0px" }, 600);
        $item.find("img, .no-image").animate({ bottom: "0px" }, 600);

        $form.find(".reveal").css({ opacity: 0, position: "relative", top: "-20px"});
        $form.find(".reveal").removeClass("hidden").animate({ opacity: 1, top: "0px"}, 400);
    });

    $(".book-text h4").each(function(){
        const lineHeight = parseFloat($(this).css("line-height"));
        const elementHeight = $(this).outerHeight();
        const lines = Math.round(elementHeight / lineHeight);
        let fontSize = parseFloat($(this).css("font-size"));

        if(lines > 1){
            fontSize -= 15;
            $(this).css("font-size", fontSize + "px");
        } 
    });

    function isInViewport(e){
        const rect = e[0].getBoundingClientRect();
        return (
            rect.bottom > 0 &&
            rect.top <= window.innerHeight - 50 //50px odshora elementu je ve viewportu
        )
    }

    function revealVisibleItems(){
        let delayCounter = 0;
        $items.each(function (){
            const $item = $(this);

            if($item.data("revealed")) return;

            if(isInViewport($item)){
                $item.data("revealed", true);

                setTimeout(() =>{
                    $item.animate({
                        opacity: 1, top: "0px"
                    }, 600);
                }, delayCounter *150);
                delayCounter++;
            }
        })
    }

    $(window).on("scroll resize", revealVisibleItems);
    setTimeout(revealVisibleItems, 100);

    $(".status-wrapper").css({
        opacity: 0, height: 0, overflow: "hidden"
    });

$("#simona-full-name").on("click", function(){
    const $links = $("#socials");
    const $books = $("#simona-books");

    if($links.hasClass("closed")){
        $links.css({ opacity: 0, top: "-30px"}).removeClass("closed");
        $links.animate({opacity: 1, top: "-10px"}, 400);
        
        $books.css({transform: "translateY(10px)"});
        
        $links.find("a, p").css({zIndex: 5});
    } else {
        $links.find("a, p").css({zIndex: -1});
        
        $links.animate({opacity: 0, top: "-30px"}, 400, function(){
            $links.addClass("closed");
        });
        
        $books.css({transform: "translateY(0px)"});
    }
});

$("h4").each(function(){
    const $this = $(this);
    const fullText = $this.text();
    const firstWord = fullText.split(/\s+/)[0];

    
    if (firstWord.length > 15) {
        const truncated = firstWord.substring(0,15).trim() + "...";
        $this.text(truncated).attr("title", fullText)
    } else if (fullText.length > 45) {
        const truncated = fullText.substring(0, 45).trim() + "...";
        $this.text(truncated).attr("title", fullText);
    }
});

});
