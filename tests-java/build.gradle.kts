plugins {
    java
}

repositories {
    mavenCentral()
}

val serenityVersion = "4.2.9"
val cucumberVersion = "7.20.1"

dependencies {
    // Serenity BDD
    testImplementation("net.serenity-bdd:serenity-core:$serenityVersion")
    testImplementation("net.serenity-bdd:serenity-cucumber:$serenityVersion")
    testImplementation("net.serenity-bdd:serenity-screenplay:$serenityVersion")
    testImplementation("net.serenity-bdd:serenity-screenplay-webdriver:$serenityVersion")
    testImplementation("net.serenity-bdd:serenity-ensure:$serenityVersion")

    // Cucumber JUnit Platform
    testImplementation("io.cucumber:cucumber-junit-platform-engine:$cucumberVersion")
    testImplementation("org.junit.platform:junit-platform-suite:1.11.4")
    testImplementation("org.junit.jupiter:junit-jupiter:5.11.4")

    // HTTP + JSON para llamadas a la API REST del backend
    testImplementation("com.squareup.okhttp3:okhttp:4.12.0")
    testImplementation("com.google.code.gson:gson:2.11.0")

    // Assertions
    testImplementation("org.assertj:assertj-core:3.26.3")

    // Logs
    testImplementation("org.slf4j:slf4j-simple:2.0.16")
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

tasks.test {
    useJUnitPlatform()
    systemProperty("webdriver.driver", "firefox")
}
