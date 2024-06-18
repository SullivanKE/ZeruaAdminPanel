// Code taken and modified from https://github.com/googlefonts/emoji-metadata?tab=readme-ov-file

function rgi(codepoints) {
    return codepoints.map(codepoint => codepoint.toString(16).padStart(4, '0')).join('_');
  }
  
  function render(codepoints) {
    return codepoints.map(codepoint => String.fromCodePoint(codepoint)).join('');
  }
  
  export async function init() {
    const ordering = await (await fetch('https://cdn.jsdelivr.net/gh/googlefonts/emoji-metadata@main/emoji_15_0_ordering.json')).json();
    
    const grid = document.createElement('div');
    grid.className = 'grid';
   
    grid.innerHTML = ordering.map(({group, emoji}) => `
      <div class="grid__group">
        <h1 class="grid__group-title" id="emoji-group-${group.replaceAll(' ', '')}">${group}</h1>
        <div class="grid__group-emojis">
          ${emoji.map(({base, shortcodes}) => `
            <button class="emoji__button" type="button" data-shortcode="${shortcodes[0]}">
              <img class="grid__emoji" src="https://fonts.gstatic.com/s/e/notoemoji/latest/${
                rgi(base)}/emoji.svg" loading="lazy" alt="${render(base)}" />
            </button>
          `).join('')}
        </div>
      </div>`).join('');


      // Make the selectors on the side
      const selectors = document.createElement('div');
      selectors.className = 'grid_selectors';
    
      selectors.innerHTML = ordering.map(({group, emoji}) => `
      <a href="#emoji-group-${group.replaceAll(' ', '')}">
          <img class="grid__emoji" src="https://fonts.gstatic.com/s/e/notoemoji/latest/${
                  rgi(emoji[0].base)}/emoji.svg" loading="lazy" alt="${render(emoji[0].base)}" />
        </a>
      `).join('');
      
    //document.body.appendChild(grid);
    
    document.getElementById('emoji-selectors').appendChild(selectors);
    document.getElementById('emojis').appendChild(grid);
  }
  
  init();