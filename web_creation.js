let i = 0;

let age = document.getElementById("Age");
for(i = 0; i <= 110; i++)
{
    let option = document.createAttribute("OPTION"),
        j = document.createTextNode(i);
    option.appendChild(j);
    age.insertBefore(option, age.lastChild);
}


